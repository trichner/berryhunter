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

type Entity struct {
	ecs.BasicEntity
	chipmunk.Body
}

func main() {

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

	log.Fatal(http.ListenAndServe(":2000", nil))

	world := ecs.World{}

	//---- setup physics
	p := setupPhysicsSystem()

	//---- add a ball
	ballEntity := createBall()
	p.AddBody(&ballEntity.BasicEntity, &ballEntity.Body)

	//add physics system
	world.AddSystem(p)

	//---- run game loop
	ticker := time.NewTicker(time.Second / 60)
	for {
		log.Printf("ball %+v", ballEntity.Body.Position())
		world.Update(1.0 / 60.0)
		<-ticker.C // wait up to 1/60th of a second
	}
}

func setupPhysicsSystem() *PhysicsSystem {

	p := &PhysicsSystem{}

	p.space = chipmunk.NewSpace()
	p.space.Gravity = vect.Vect{X: 0, Y: -900}

	// Add a static body - lines etc.
	staticBody := chipmunk.NewBodyStatic()

	size := vect.Float(1024)
	floor := chipmunk.NewBox(vect.Vector_Zero, size, size)
	floor.SetElasticity(0)
	floor.SetFriction(1)
	staticBody.AddShape(floor)
	//TODO add box
	p.space.AddBody(staticBody)
	return p
}

func createBall() *Entity {

	// Create a ball
	ballEntity := &Entity{BasicEntity: ecs.NewBasic()}

	var mass float32 = 10.0
	ball := chipmunk.NewCircle(vect.Vector_Zero, float32(10))
	ball.SetElasticity(0.95)

	// Create a body for the ball
	body := chipmunk.NewBody(vect.Float(mass), ball.Moment(mass))
	body.SetPosition(vect.Vect{200.0, 600.0})
	//`body.SetAngle(vect.Float(rand.Float32() * 2 * math.Pi))
	body.AddShape(ball)

	ballEntity.Body = *body
	return ballEntity
}
