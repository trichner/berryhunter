package core

import (
	"engo.io/ecs"
	"fmt"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/trichner/berryhunter/backend/conf"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/items/mobs"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/model/client"
	"github.com/trichner/berryhunter/backend/model/spectator"
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/sys"
	"github.com/trichner/berryhunter/backend/sys/chat"
	"github.com/trichner/berryhunter/backend/sys/cmd"
	"github.com/trichner/berryhunter/backend/sys/heater"
	"log"
	"net/http"
	"sync/atomic"
	"time"
	"sort"
)

type entitiesMap map[uint64]model.BasicEntity

type game struct {
	ecs.World
	Tick         uint64
	conf         *conf.Config
	itemRegistry items.Registry
	mobRegistry  mobs.Registry

	entities entitiesMap

	welcomeMsg []byte

	joinQueue chan model.Client
}

// assert game implements its interface
var _ = model.Game(&game{})

func NewGame(conf *conf.Config, items items.Registry, mobs mobs.Registry, tokens []string, radius float32) model.Game {
	g := &game{
		conf:         conf,
		itemRegistry: items,
		mobRegistry:  mobs,
		entities:     make(entitiesMap),
		joinQueue:    make(chan model.Client, 16),
	}

	// Prepare welcome message. Its static anyways.
	msg := &codec.Welcome{
		"berryhunter.io [Alpha] rza, n1b, gino & co.",
		radius * codec.Points2px,
	}
	builder := flatbuffers.NewBuilder(32)
	welcomeMsg := codec.WelcomeMessageFlatbufMarshal(builder, msg)
	builder.Finish(welcomeMsg)
	g.welcomeMsg = builder.FinishedBytes()

	//---- setup systems
	p := sys.NewPhysicsSystem()
	g.AddSystem(p)

	wall := phy.NewInvCircle(phy.VEC2F_ZERO, radius)
	wall.Shape().Layer = model.LayerBorderCollision
	p.AddStaticBody(ecs.NewBasic(), wall)

	n := NewNetSystem(g)
	g.AddSystem(n)

	i := NewInputSystem(g)
	g.AddSystem(i)

	m := sys.NewMobSystem(g)
	g.AddSystem(m)

	f := heater.New()
	g.AddSystem(f)

	pl := sys.NewUpdateSystem()
	g.AddSystem(pl)

	s := sys.NewConnectionStateSystem(g)
	g.AddSystem(s)

	c := cmd.NewCommandSystem(g, tokens)
	g.AddSystem(c)

	chat := chat.New()
	g.AddSystem(chat)

	d := sys.NewDecaySystem(g)
	g.AddSystem(d)

	g.printSystems()
	return g
}

func (g *game) Items() items.Registry {
	return g.itemRegistry
}

func (g *game) Mobs() mobs.Registry {
	return g.mobRegistry
}

func (g *game) Handler() http.HandlerFunc {

	return net.NewHandleFunc(func(c *net.Client) {
		client := client.NewClient(c)
		g.sendWelcomeMessage(client)

		select {
		case g.joinQueue <- client:
		default:
			log.Printf("😱 Join queue full! Dropping client.")
			client.Close()
		}

	})
}

func (g *game) Loop() {

	//---- run game loop
	tickrate := time.Millisecond * 33
	tps := time.Second / tickrate
	log.Printf("Starting loop with %d tps", tps)

	ticker := time.NewTicker(tickrate)
	for {
		g.update()
		<-ticker.C
	}
}

func (g *game) GetEntity(id uint64) (model.BasicEntity, error) {

	e, ok := g.entities[id]
	if !ok {
		return nil, fmt.Errorf("Entity with id %d not found.", id)
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
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			sys.AddEntity(e)
		case *NetSystem:
			sys.AddSpectator(e)
		case *sys.ConnectionStateSystem:
			sys.AddSpectator(e)
		}
	}
}

func (g *game) addMobEntity(e model.MobEntity) {

	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			sys.AddEntity(e)
		case *NetSystem:
			sys.AddEntity(e)
		case *sys.MobSystem:
			sys.AddEntity(e)
		}
	}
}

func (g *game) addPlaceableEntity(p model.PlaceableEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			sys.AddEntity(p)
		case *NetSystem:
			sys.AddEntity(p)
		case *sys.UpdateSystem:
			sys.AddUpdateable(p)
		case *sys.DecaySystem:
			sys.AddDecayable(p)
		case *heater.HeaterSystem:
			if p.HeatRadiation() != nil {
				sys.AddHeater(p)
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
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *sys.PhysicsSystem:
			sys.AddStaticBody(e.Basic(), e.Bodies()[0])
		case *NetSystem:
			sys.AddEntity(e)
		case *sys.UpdateSystem:
			sys.AddUpdateable(e)
		}
	}
}

func (g *game) addPlayer(p model.PlayerEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {
		case *sys.PhysicsSystem:
			sys.AddEntity(p)
		case *NetSystem:
			sys.AddPlayer(p)
		case *PlayerInputSystem:
			sys.AddPlayer(p)
		case *sys.UpdateSystem:
			sys.AddUpdateable(p)
		case *cmd.CommandSystem:
			sys.AddPlayer(p)
		case *chat.ChatSystem:
			sys.AddPlayer(p)
		case *sys.ConnectionStateSystem:
			sys.AddPlayer(p)
		}
	}
}

const stepMillis = 33.0

func (g *game) update() {

	// fixed 33ms steps
	beforeMillis := time.Now().UnixNano() / 1000000

	// accept at most one player per tick
	select{
	case client := <- g.joinQueue:
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

	log.Printf("Ordered Systems:")
	for _, s := range systems {
		p := 0
		if prioritizer, ok := s.(ecs.Prioritizer); ok {
			p = prioritizer.Priority()
		}
		log.Printf(" %4d %T", p, s)
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


