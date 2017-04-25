package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"log"
	"time"
	"fmt"
	"net/http"
)

func main() {

	log.Printf("Setting up world")

	server := NewServer("/echo")
	go server.Listen()
	go func() {

		for {
			select {
			case msg := <-server.rxCh:
				log.Printf("Received 1 message from %d", msg.client.id)
				server.Tx(msg.client.id, msg.body)
			case err := <-server.errCh:
				fmt.Errorf("Err: %s", err)
			}
		}
	}()

	go http.ListenAndServe(":2000", nil)

	//---- setup world
	world := ecs.World{}

	//---- setup systems
	p := newPhysicsSystem()
	world.AddSystem(p)

	n := newNetSystem(server)
	n.server = server
	world.AddSystem(n)

	//---- add a ball
	circleEntity := newCircleEntity(100, 100, 10, 1)
	p.AddBody(&circleEntity.BasicEntity, &circleEntity.Body)
	n.AddBody(circleEntity)

	tiger := SabreToothTiger(newCircleEntity(90, 100, 10, 0.1))
	p.AddBody(&tiger.BasicEntity, &tiger.Body)
	n.AddBody(&tiger.entity)

	//---- run game loop
	log.Printf("Starting loop")
	tick := 0
	tickrate := time.Second / 60
	ticker := time.NewTicker(tickrate)
	for {
		world.Update(1.0 / 60.0)

		<-ticker.C // wait up to 1/60th of a second
		tick++
	}
}

func newPhysicsSystem() *PhysicsSystem {

	p := &PhysicsSystem{}

	p.space = chipmunk.NewSpace()
	p.space.Gravity = vect.Vect{X: 0, Y: 0}

	// Add a static body - lines etc.
	staticBody := chipmunk.NewBodyStatic()

	size := vect.Float(9000)
	floor := chipmunk.NewBox(vect.Vector_Zero, size, size)
	floor.SetElasticity(0)
	floor.SetFriction(1)
	staticBody.AddShape(floor)

	//TODO add box
	p.space.AddBody(staticBody)
	return p
}

func newNetSystem(s *Server) *NetSystem {
	//TODO configure path/ports here
	return &NetSystem{server: s}
}

func newCircleEntity(x, y, r, m float32) *entity {

	// Create a ball
	ballEntity := &entity{BasicEntity: ecs.NewBasic()}

	ball := chipmunk.NewCircle(vect.Vector_Zero, r)
	ball.SetElasticity(0.95)

	// Create a body for the ball
	body := chipmunk.NewBody(vect.Float(m), ball.Moment(m))
	body.SetPosition(vect.Vect{vect.Float(x), vect.Float(y)})
	//`body.SetAngle(vect.Float(rand.Float32() * 2 * math.Pi))
	body.AddShape(ball)

	ballEntity.Body = *body
	return ballEntity
}
