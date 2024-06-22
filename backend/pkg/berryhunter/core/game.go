package core

import (
	"fmt"
	"log/slog"
	"math/rand"
	"net/http"
	"sort"
	"sync/atomic"
	"time"

	"github.com/EngoEngine/ecs"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/pkg/berryhunter/cfg"
	"github.com/trichner/berryhunter/pkg/berryhunter/codec"
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/client"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/constant"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/spectator"
	"github.com/trichner/berryhunter/pkg/berryhunter/net"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
	"github.com/trichner/berryhunter/pkg/berryhunter/sys"
	"github.com/trichner/berryhunter/pkg/berryhunter/sys/chat"
	"github.com/trichner/berryhunter/pkg/berryhunter/sys/cmd"
	"github.com/trichner/berryhunter/pkg/berryhunter/sys/heater"
	"github.com/trichner/berryhunter/pkg/berryhunter/sys/statuseffects"
)

type entitiesMap map[uint64]model.BasicEntity

type game struct {
	ecs.World
	Tick         uint64
	config       *cfg.GameConfig
	itemRegistry items.Registry
	mobRegistry  mobs.Registry

	entities entitiesMap

	welcomeMsg []byte

	joinQueue chan model.Client
	radius    float32
}

// assert game implements its interface
var _ = model.Game(&game{})

func NewGameWith(seed int64, conf ...Configuration) (model.Game, error) {
	gc := &cfg.GameConfig{
		Radius: 20,
		Tokens: []string{},
	}

	for _, c := range conf {
		err := c(gc)
		if err != nil {
			return nil, err
		}
	}
	slog.Debug("new game with config", slog.Any("configuration", gc))

	g := &game{
		entities:     make(entitiesMap),
		joinQueue:    make(chan model.Client, 16),
		mobRegistry:  gc.MobRegistry,
		itemRegistry: gc.ItemRegistry,
		radius:       gc.Radius,
		config:       gc,
	}

	// Prepare welcome message. Its static anyways.
	msg := &codec.Welcome{
		"berryhunter.io [Alpha] rza, n1b, xyckno & co.",
		gc.Radius * codec.Points2px,
	}
	builder := flatbuffers.NewBuilder(32)
	welcomeMsg := codec.WelcomeMessageFlatbufMarshal(builder, msg)
	builder.Finish(welcomeMsg)
	g.welcomeMsg = builder.FinishedBytes()

	//---- create rnd to generate deterministic seeds for systems
	rnd := rand.New(rand.NewSource(seed))

	//---- setup systems
	p := sys.NewPhysicsSystem()
	g.AddSystem(p)

	wall := phy.NewInvCircle(phy.VEC2F_ZERO, gc.Radius)
	wall.Shape().Layer = int(model.LayerBorderCollision)
	p.AddStaticBody(ecs.NewBasic(), wall)

	n := NewNetSystem(g)
	g.AddSystem(n)

	i := NewInputSystem(g)
	g.AddSystem(i)

	m := sys.NewMobSystem(g, rnd.Int63())
	g.AddSystem(m)

	f := heater.New()
	g.AddSystem(f)

	preu := sys.NewPreUpdateSystem()
	g.AddSystem(preu)

	pl := sys.NewUpdateSystem()
	g.AddSystem(pl)

	postu := sys.NewPostUpdateSystem()
	g.AddSystem(postu)

	se := statuseffects.NewStatusEffectsSystem()
	g.AddSystem(se)

	s := sys.NewConnectionStateSystem(g)
	g.AddSystem(s)

	c := cmd.NewCommandSystem(g, gc.Tokens)
	g.AddSystem(c)

	chat := chat.New()
	g.AddSystem(chat)

	d := sys.NewDecaySystem(g)
	g.AddSystem(d)

	dayCycle := sys.NewDayCycleSystem(g, constant.DayNightCyleTicks, gc.ColdFractionNightPerS, gc.ColdFractionDayPerS)
	g.AddSystem(dayCycle)

	sb := sys.NewScoreboardSystem(g)
	g.AddSystem(sb)

	g.printSystems()
	return g, nil
}

func (g *game) Ticks() uint64 {
	return g.Tick
}

func (g *game) Radius() float32 {
	return g.radius
}

func (g *game) Items() items.Registry {
	return g.itemRegistry
}

func (g *game) Mobs() mobs.Registry {
	return g.mobRegistry
}

func (g *game) Handler() http.Handler {
	return net.NewHandleFunc(func(c *net.Client) {
		client := client.NewClient(c)
		g.sendWelcomeMessage(client)

		select {
		case g.joinQueue <- client:
		default:
			slog.Info("😱 Join queue full! Dropping client.", slog.String("uuid", client.UUID().String()))
			client.Close()
		}
	})
}

func (g *game) Loop() {
	//---- run game loop
	tickrate := time.Second / constant.TicksPerSecond
	slog.Info("starting game loop", slog.Int("ticks_per_second", constant.TicksPerSecond))

	ticker := time.NewTicker(tickrate)
	for {
		g.update()
		<-ticker.C
	}
}

func (g *game) Config() *cfg.GameConfig {
	return g.config
}

func (g *game) GetEntity(id uint64) (model.BasicEntity, error) {
	e, ok := g.entities[id]
	if !ok {
		return nil, fmt.Errorf("entity with id %d not found", id)
	}
	return e, nil
}

func (g *game) RemoveEntity(e ecs.BasicEntity) {
	delete(g.entities, e.ID())
	g.World.RemoveEntity(e)
}

func (g *game) AddEntity(e model.BasicEntity) {
	g.entities[e.Basic().ID()] = e

	switch v := e.(type) {
	case model.PlayerEntity:
		g.addPlayer(v)
	case model.MobEntity:
		g.addMobEntity(v)
	case model.ResourceEntity:
		g.addResourceEntity(v)
	case model.PlaceableEntity:
		g.addPlaceableEntity(v)
	case model.Spectator:
		g.addSpectator(v)
	case model.Entity:
		g.addEntity(v)
	}
}

func (g *game) addSpectator(e model.Spectator) {
	// Loop over all Systems
	for _, system := range g.Systems() {
		// Use a type-switch to figure out which System is which
		switch s := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			s.AddEntity(e)
		case *NetSystem:
			s.AddSpectator(e)
		case *sys.ConnectionStateSystem:
			s.AddSpectator(e)
		case *sys.ScoreboardSystem:
			s.AddSpectator(e)
		}
	}
}

func (g *game) addMobEntity(e model.MobEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {
		// Use a type-switch to figure out which System is which
		switch s := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			s.AddEntity(e)
		case *statuseffects.StatusEffectsSystem:
			s.Add(e, e)
		case *NetSystem:
			s.AddEntity(e)
		case *sys.MobSystem:
			s.AddEntity(e)
		}
	}
}

func (g *game) addPlaceableEntity(p model.PlaceableEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {
		// Use a type-switch to figure out which System is which
		switch s := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			s.AddEntity(p)
		case *NetSystem:
			s.AddEntity(p)
		case *statuseffects.StatusEffectsSystem:
			s.Add(p, p)
		case *sys.UpdateSystem:
			s.AddUpdateable(p)
		case *sys.DecaySystem:
			s.AddDecayable(p)
		case *heater.HeaterSystem:
			if p.HeatRadiation() != nil {
				s.AddHeater(p)
			}
		}
	}
}

func (g *game) addEntity(e model.Entity) {
	// Loop over all Systems
	for _, system := range g.Systems() {
		// Use a type-switch to figure out which System is which
		switch s := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			s.AddStaticBody(e.Basic(), e.Bodies()[0])
		case *NetSystem:
			s.AddEntity(e)
		}
	}
}

func (g *game) addResourceEntity(e model.ResourceEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {
		// Use a type-switch to figure out which System is which
		switch s := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			s.AddStaticBody(e.Basic(), e.Bodies()[0])
		case *statuseffects.StatusEffectsSystem:
			s.Add(e, e)
		case *NetSystem:
			s.AddEntity(e)
		case *sys.UpdateSystem:
			s.AddUpdateable(e)
		}
	}
}

func (g *game) addPlayer(p model.PlayerEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {
		// Use a type-switch to figure out which System is which
		switch s := system.(type) {
		case *sys.PhysicsSystem:
			s.AddEntity(p)
		case *NetSystem:
			s.AddPlayer(p)
		case *PlayerInputSystem:
			s.AddPlayer(p)
		case *sys.UpdateSystem:
			s.AddUpdateable(p)
		case *statuseffects.StatusEffectsSystem:
			s.Add(p, p)
		case *cmd.CommandSystem:
			s.AddPlayer(p)
		case *chat.ChatSystem:
			s.AddPlayer(p)
		case *sys.ConnectionStateSystem:
			s.AddPlayer(p)
		case *heater.HeaterSystem:
			s.AddPlayer(p)
		case *sys.DayCycleSystem:
			s.AddPlayer(p)
		case *sys.ScoreboardSystem:
			s.AddPlayer(p)
		}
	}
}

const stepMillis = 33.0

func (g *game) update() {
	// fixed 33ms steps
	beforeMillis := time.Now().UnixNano() / 1000000

	// accept at most one player per tick
	select {
	case client := <-g.joinQueue:
		s := spectator.NewSpectator(phy.VEC2F_ZERO, client)
		g.AddEntity(s)
	default:
	}

	g.World.Update(stepMillis)

	nowMillis := time.Now().UnixNano() / 1000000
	dtMillis := nowMillis - beforeMillis
	if dtMillis > stepMillis {
		load := dtMillis / stepMillis * 100
		fmt.Printf("Overload! Systems at: %d%%\n", load)
	}

	// needs to be atomic to prevent race conditions
	atomic.AddUint64(&g.Tick, 1)
}

func (g *game) sendWelcomeMessage(c model.Client) {
	c.SendMessage(g.welcomeMsg)
}

func (g *game) printSystems() {
	systems := g.World.Systems()
	sort.Sort(ByPriority(systems))

	slog.Debug("enabled systems", slog.Int("count", len(systems)))
	for _, s := range systems {
		p := 0
		if prioritizer, ok := s.(ecs.Prioritizer); ok {
			p = prioritizer.Priority()
		}
		slog.Debug(fmt.Sprintf("%4d %T", p, s))
	}
}

type ByPriority []ecs.System

func (b ByPriority) Len() int {
	return len(b)
}

func (b ByPriority) Less(i, j int) bool {
	pi := 0
	if p, ok := b[i].(ecs.Prioritizer); ok {
		pi = p.Priority()
	}

	pj := 0
	if p, ok := b[i].(ecs.Prioritizer); ok {
		pj = p.Priority()
	}
	return pi < pj
}

func (b ByPriority) Swap(i, j int) {
	b[i], b[j] = b[j], b[i]
}
