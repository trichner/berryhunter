package sys

import (
	"engo.io/ecs"
	"fmt"
	"net/http"
	"sync/atomic"
	"time"
	"github.com/trichner/berryhunter/backend/conf"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/trichner/berryhunter/backend/model/client"
	"github.com/trichner/berryhunter/backend/model/spectator"
	"github.com/trichner/berryhunter/backend/mobs"
	"github.com/trichner/berryhunter/backend/sys/chat"
	"github.com/trichner/berryhunter/backend/sys/heater"
	"github.com/google/flatbuffers/go"
	"log"
)

type Game struct {
	ecs.World
	Space *phy.Space
	Tick  uint64
	conf  *conf.Config
	Items items.Registry
	Mobs  mobs.Registry

	WelcomeMsg *codec.Welcome
}

type wsHandler struct{}

func (h *wsHandler) OnConnected(c *net.Client) {

}

func (h *wsHandler) OnDisconnected(c *net.Client) {

}

func (h *wsHandler) OnMessage(c *net.Client, msg []byte) {

}

func (g *Game) Init(conf *conf.Config, items items.Registry, mobs mobs.Registry) {

	g.conf = conf
	g.Items = items
	g.Mobs = mobs

	mapSide := 100
	g.WelcomeMsg = &codec.Welcome{
		"berryhunter.io [Alpha] rza, n1b, gino & co.",
		mapSide,
	}

	//---- setup systems
	p := newPhysicsSystem(g, mapSide, mapSide)
	g.AddSystem(p)

	n := NewNetSystem(g)
	g.AddSystem(n)

	i := NewInputSystem(g)
	g.AddSystem(i)

	m := NewMobSystem(g)
	g.AddSystem(m)

	f := heater.New()
	g.AddSystem(f)

	pl := NewUpdateSystem()
	g.AddSystem(pl)

	s := NewConnectionStateSystem(g)
	g.AddSystem(s)

	c := NewCheatSystem(g, []string{})
	g.AddSystem(c)

	chat := chat.New()
	g.AddSystem(chat)

	d := NewDecaySystem(g)
	g.AddSystem(d)

}

func (g *Game) Handler() http.HandlerFunc {

	return net.NewHandleFunc(func(c *net.Client) {
		client := client.NewClient(c)
		sendWelcomeMessage(g, client)
		s := spectator.NewSpectator(phy.VEC2F_ZERO, client)

		g.AddEntity(s)
	})
}

func (g *Game) Loop() {

	//---- run game loop
	tickrate := time.Millisecond * 33
	tps := time.Second / tickrate
	log.Printf("Starting loop with %d tps", tps)

	ticker := time.NewTicker(tickrate)
	for {
		g.Update()
		<-ticker.C
	}
}

func (g *Game) AddEntity(e model.BasicEntity) {

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

func (g *Game) addSpectator(e model.Spectator) {

	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddEntity(e)
		case *NetSystem:
			sys.AddSpectator(e)
		case *ConnectionStateSystem:
			sys.AddSpectator(e)
		}
	}
}

func (g *Game) addMobEntity(e model.MobEntity) {

	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddEntity(e)
		case *NetSystem:
			sys.AddEntity(e)
		case *MobSystem:
			sys.AddEntity(e)
		}
	}
}

func (g *Game) addPlaceableEntity(p model.PlaceableEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddEntity(p)
		case *NetSystem:
			sys.AddEntity(p)
		case *UpdateSystem:
			sys.AddUpdateable(p)
		case *DecaySystem:
			sys.AddDecayable(p)
		case *heater.HeaterSystem:
			if p.HeatRadiation() != nil {
				sys.AddHeater(p)
			}
		}
	}
}

func (g *Game) addEntity(e model.Entity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch s := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			s.AddStaticBody(e.Basic(), e.Bodies()[0])
		case *NetSystem:
			s.AddEntity(e)
		}
	}
}

func (g *Game) addResourceEntity(e model.ResourceEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddStaticBody(e.Basic(), e.Bodies()[0])
		case *NetSystem:
			sys.AddEntity(e)
		}
	}
}

func (g *Game) addPlayer(p model.PlayerEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddEntity(p)
		case *NetSystem:
			sys.AddPlayer(p)
			// Create a case for each System you want to use
		case *PlayerInputSystem:
			sys.AddPlayer(p)
		case *UpdateSystem:
			sys.AddUpdateable(p)
		case *CheatSystem:
			sys.AddPlayer(p)
		case *chat.ChatSystem:
			sys.AddPlayer(p)
		case *ConnectionStateSystem:
			sys.AddPlayer(p)
		}
	}
}

const stepMillis = 33.0

//const step = float32(stepMillis / 1000.0)

func (g *Game) Update() {

	// fixed 33ms steps
	beforeMillis := time.Now().UnixNano() / 1000000

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

func newPhysicsSystem(g *Game, x, y int) *PhysicsSystem {

	//overlap := vect.Float(3)
	//xf := vect.Float(x)
	//yf := vect.Float(y)
	p := &PhysicsSystem{}
	p.game = g
	g.Space = phy.NewSpace()

	return p
}

func sendWelcomeMessage(g *Game, c model.Client) {

	builder := flatbuffers.NewBuilder(32)
	welcomeMsg := codec.WelcomeMessageFlatbufMarshal(builder, g.WelcomeMsg)
	builder.Finish(welcomeMsg)
	c.SendMessage(builder.FinishedBytes())
}
