package main

import (
	"engo.io/ecs"
	"fmt"
	"net/http"
	"sync/atomic"
	"github.com/trichner/death-io/backend/conf"
	"github.com/vova616/chipmunk"
)

type Game struct {
	ecs.World
	server *Server
	space *chipmunk.Space
	tick   uint64
	conf   *conf.Config
}

func (g *Game) Init(conf *conf.Config) {

	g.conf = conf

	g.server = NewServer(conf.Path, func(c *Client) {

		player := &player{
			client: c,
			Health: 100,
			Hunger: 0,
			entity: newCircleEntity(20.0, 20.0, 5.0, 1),
		}

		g.addPlayer(player)
	})

	//---- setup systems
	p := newPhysicsSystem()
	g.AddSystem(p)

	n := NewNetSystem(g)
	g.AddSystem(n)

	i := NewInputSystem(g)
	g.AddSystem(i)
}

func (g *Game) Run() {

	go g.server.Listen()
	go func() {

		for {
			select {
			case err := <-g.server.errCh:
				fmt.Errorf("Err: %s", err)
			}
		}
	}()

	addr := fmt.Sprintf(":%d", g.conf.Port)
	go http.ListenAndServe(addr, nil)
}

func (g *Game) addEntity(e *entity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddBody(&e.BasicEntity, &e.body)
		case *NetSystem:
			sys.AddEntity(e)
		}
	}
}

func (g *Game) addTiger(s *SabreToothTiger) {
	g.addEntity(&s.entity)
}

func (g *Game) addPlayer(p *player) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddBody(&p.BasicEntity, &p.body)
		case *NetSystem:
			sys.AddPlayer(p)
			// Create a case for each System you want to use
		case *InputSystem:
			sys.AddPlayer(p)
		}
	}
}

func (g *Game) Update() {

	// fixed 33ms steps
	g.World.Update(33.0 / 1000.0)

	// needs to be atomic to prevent race conditions
	atomic.AddUint64(&g.tick, 1)
}
