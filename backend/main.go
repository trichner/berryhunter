package main

import (
	"engo.io/ecs"
	"github.com/trichner/death-io/backend/conf"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"log"
	"time"
)

func main() {

	config := readConf()

	g := &Game{}
	g.Init(config)

	//---- add a ball
	circleEntity := newCircleEntity(100, 100, 10, 1)
	g.addEntity(&circleEntity)

	tiger := &SabreToothTiger{newCircleEntity(90, 100, 10, 1)}
	g.addTiger(tiger)

	g.Run()

	//---- run game loop
	log.Printf("Starting loop")
	tickrate := time.Millisecond * 33
	ticker := time.NewTicker(tickrate)
	for {
		g.Update()
		<-ticker.C
	}
}

func readConf() *conf.Config {

	configFile := "./conf.json"
	config, err := conf.ReadConfig(configFile)
	if err != nil {
		log.Panicf("Cannot read config '%s':%v", configFile, err)
	}
	return config
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
	floor.SetFriction(0.3)
	staticBody.AddShape(floor)

	//TODO add box
	p.space.AddBody(staticBody)
	return p
}

func newCircleEntity(x, y, r, m float32) entity {

	// Create a ball
	ballEntity := entity{BasicEntity: ecs.NewBasic()}

	ball := chipmunk.NewCircle(vect.Vector_Zero, r)
	ball.SetElasticity(0.95)

	// Create a body for the ball
	body := chipmunk.NewBody(vect.Float(m), ball.Moment(m))
	body.SetPosition(vect.Vect{vect.Float(x), vect.Float(y)})
	//`body.SetAngle(vect.Float(rand.Float32() * 2 * math.Pi))
	body.AddShape(ball)

	ballEntity.body = *body
	return ballEntity
}