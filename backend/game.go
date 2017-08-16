package main

import (
	"engo.io/ecs"
	"fmt"
	"net/http"
	"sync/atomic"
	"time"
	"flag"
	"log"
	"os"
	"github.com/trichner/berryhunter/backend/conf"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/trichner/berryhunter/backend/model/client"
	"github.com/trichner/berryhunter/backend/model/spectator"
)

type Game struct {
	ecs.World
	space *phy.Space
	tick  uint64
	conf  *conf.Config
	items items.Registry

	welcomeMsg *codec.Welcome
}

type wsHandler struct{}

func (h *wsHandler) OnConnected(c *net.Client) {

}

func (h *wsHandler) OnDisconnected(c *net.Client) {

}

func (h *wsHandler) OnMessage(c *net.Client, msg []byte) {

}

func (g *Game) Init(conf *conf.Config, items items.Registry) {
	

	g.conf = conf
	g.items = items

	mapSide := 100
	g.welcomeMsg = &codec.Welcome{
		"k42.ch [Alpha]",
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

	f := NewFreezerSystem(g)
	g.AddSystem(f)

	pl := NewPlayerUpdateSystem()
	g.AddSystem(pl)

	s := NewSpectatorSystem(g)
	g.AddSystem(s)

	c := NewCheatSystem(g, []string{})
	g.AddSystem(c)

}

func (g *Game) Run() {

	//TODO move into main
	var dev, help bool
	flag.BoolVar(&dev, "dev", false, "Serve frontend directly")
	flag.BoolVar(&help, "help", false, "Show usage help")
	flag.Parse()
	if help {
		flag.Usage()
		os.Exit(1)
	}

	handleFunc := net.NewHandleFunc(func(c *net.Client) {
		client := client.NewClient(c)
		s := spectator.NewSpectator(phy.VEC2F_ZERO, client)
		g.AddEntity(s)
	})

	addr := fmt.Sprintf(":%d", g.conf.Port)
	http.HandleFunc(g.conf.Path, handleFunc)

	if dev {
		log.Print("Using development server.")
		http.Handle("/", http.FileServer(http.Dir("./../frontend")))
	}

	go http.ListenAndServe(addr, nil)
}

func (g *Game) RemoveEntity(e ecs.BasicEntity) {

	for _, system := range g.Systems() {

		system.Remove(e)
	}
}

func (g *Game) AddEntity(e model.BasicEntity) {

	switch v := e.(type) {
	case model.PlayerEntity:
		p, ok := v.(*player)
		if !ok {
			log.Fatal("Cannot add player!")
		}
		g.addPlayer(p)
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
		case *SpectatorSystem:
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
		case *FreezerSystem:
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
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddStaticBody(e.Basic(), e.Bodies()[0])
		case *NetSystem:
			sys.AddEntity(e)
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

func (g *Game) addPlayer(p *player) {
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
		case *PlayerUpdate:
			sys.AddPlayer(p)
		case *CheatSystem:
			sys.AddPlayer(p)
		}
	}
}

const stepMillis = 33.0
const step = float32(stepMillis / 1000.0)

func (g *Game) Update() {

	// fixed 33ms steps
	beforeMillis := time.Now().UnixNano() / 1000000

	g.World.Update(step)

	nowMillis := time.Now().UnixNano() / 1000000
	dtMillis := nowMillis - beforeMillis
	if dtMillis > stepMillis {
		load := dtMillis / stepMillis * 100
		fmt.Printf("Overload! Systems at: %d%%\n", load)
	}

	// needs to be atomic to prevent race conditions
	atomic.AddUint64(&g.tick, 1)
}

func newPhysicsSystem(g *Game, x, y int) *PhysicsSystem {

	//overlap := vect.Float(3)
	//xf := vect.Float(x)
	//yf := vect.Float(y)
	p := &PhysicsSystem{}
	p.game = g
	g.space = phy.NewSpace()

	//---- adding walls around map

	//var bdy *chipmunk.Body
	//var wall *chipmunk.Shape
	//
	//// bottom
	//wall = chipmunk.NewBox(toVect(xf/2.0, yf+overlap/2.0), 2.0*overlap+xf, overlap)
	//bdy = shape2wall(wall)
	//g.space.AddStaticBody(bdy)
	//
	//// top
	//wall = chipmunk.NewBox(toVect(xf/2.0, 0-overlap/2.0), 2.0*overlap+xf, overlap)
	//bdy = shape2wall(wall)
	//g.space.AddStaticBody(bdy)
	//
	//// left
	//wall = chipmunk.NewBox(toVect(0-overlap/2.0, yf/2.0), overlap, 2.0*overlap+yf)
	//bdy = shape2wall(wall)
	//g.space.AddStaticBody(bdy)
	//
	//// right
	//wall = chipmunk.NewBox(toVect(xf+overlap/2.0, yf/2.0), overlap, 2.0*overlap+yf)
	//bdy = shape2wall(wall)
	//g.space.AddStaticBody(bdy)

	return p
}

//func shape2wall(s *phy.Shape) *phy.Shape {
//	s.Group = staticBodyGroup
//	s.Layer = staticCollisionLayer | actionCollisionLayer
//
//	walls = append(walls, &entity{
//		BasicEntity: ecs.NewBasic(),
//		body:        s,
//		entityType:  DeathioApi.EntityTypeBorder,
//	})
//	return s
//}

