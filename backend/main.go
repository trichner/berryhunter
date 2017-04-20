package main

import (
	"engo.io/ecs"
	"fmt"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"log"
	"math"
	"math/rand"
	"time"
)

type Entity struct {
	ecs.BasicEntity
	chipmunk.Body
}

func main() {

	fmt.Printf("Hello, world.\n")

	world := ecs.World{}

	//---- setup physics
	p := PhysicsSystem{}

	p.space = chipmunk.NewSpace()
	p.space.Gravity = vect.Vect{0, -900}

	// Add a static body - lines etc.
	staticBody := chipmunk.NewBodyStatic()

	size := vect.Float(1024)
	floor := chipmunk.NewBox(vect.Vector_Zero, size, size)
	floor.SetElasticity(0)
	floor.SetFriction(0.5)
	staticBody.AddShape(floor)
	//TODO add box
	p.space.AddBody(staticBody)

	// Create a ball
	ballEntity := &Entity{BasicEntity: ecs.NewBasic()}
	ball := chipmunk.NewCircle(vect.Vector_Zero, float32(10))
	ball.SetElasticity(0.95)

	// Create a body for the ball
	body := chipmunk.NewBody(vect.Float(1), ball.Moment(float32(1)))
	body.SetPosition(vect.Vect{vect.Float(1), 600.0})
	body.SetAngle(vect.Float(rand.Float32() * 2 * math.Pi))
	body.AddShape(ball)
	ballEntity.Body = *body
	//p.space.AddBody(body)

	p.AddBody(&ballEntity.BasicEntity, &ballEntity.Body)

	//add physics system
	world.AddSystem(p)

	//---- run game loop
	// I love tickers for this kind of stuff. We want to calc the state of the
	// space every 60th of a second.
	ticker := time.NewTicker(time.Second / 60)
	for {
		log.Printf("ball %+v", body.Position())
		world.Update(float32(time.Second / 60))
		<-ticker.C // wait up to 1/60th of a second
	}
}
