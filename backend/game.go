package main

import (
	"engo.io/ecs"
	"fmt"
	"net/http"
	"sync/atomic"
)

type Game struct {
	ecs.World
	server *Server
	tick   uint64
}

func (g *Game) Init() {

	g.server = NewServer("/echo", func(c *Client) {

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
	go http.ListenAndServe(":2000", nil)
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

	atomic.AddUint64(&g.tick, 1)
}
