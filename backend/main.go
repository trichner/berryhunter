package main

import (
	"engo.io/ecs"
	"github.com/trichner/death-io/backend/conf"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"log"
	"math/rand"
	"time"
)

func main() {

	config := readConf()

	g := &Game{}
	g.Init(config)

	//---- add a ball
	rabbit := NewRabbit()
	g.addEntity(rabbit)

	tiger := NewSaberToothCat()
	g.addEntity(tiger)

	populate(g, rand.New(rand.NewSource(0xDEADBEEF)))

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

func newPhysicsSystem(x, y int) *PhysicsSystem {

	overlap := vect.Float(3)
	xf := vect.Float(x)
	yf := vect.Float(y)
	p := &PhysicsSystem{}

	p.space = chipmunk.NewSpace()
	p.space.Gravity = vect.Vect{X: 0, Y: 0}

	// Add a static body - lines etc.
	staticBody := chipmunk.NewBodyStatic()

	floor := chipmunk.NewBox(vect.Vect{-overlap, -overlap}, xf+2*overlap, yf+2*overlap)
	floor.SetElasticity(0)
	floor.SetFriction(0.3)
	staticBody.AddShape(floor)
	p.space.AddBody(staticBody)

	//---- adding walls around map

	var bdy *chipmunk.Body
	var wall *chipmunk.Shape

	// bottom
	wall = chipmunk.NewBox(toVect(0-overlap, yf), 2*overlap+xf, overlap)
	bdy = shape2staticBody(wall)
	p.space.AddBody(bdy)

	// top
	wall = chipmunk.NewBox(toVect(0-overlap, 0-overlap), 2*overlap+xf, overlap)
	bdy = shape2staticBody(wall)
	p.space.AddBody(bdy)

	// left
	wall = chipmunk.NewBox(toVect(0-overlap, 0-overlap), overlap, 2*overlap+yf)
	bdy = shape2staticBody(wall)
	p.space.AddBody(bdy)

	// right
	wall = chipmunk.NewBox(toVect(xf, 0-overlap), overlap, 2*overlap+yf)
	bdy = shape2staticBody(wall)
	p.space.AddBody(bdy)

	return p
}

func newStaticCircleEntity(x, y, r float32) entity {

	// Create a ball
	ballEntity := entity{BasicEntity: ecs.NewBasic()}

	ball := chipmunk.NewCircle(vect.Vector_Zero, r)
	ball.SetElasticity(0.5)

	// everything collides with everything :/
	ball.Layer = -1 // all layers 0xFFFF
	ball.Group = chipmunk.Group(ballEntity.ID())

	// Create a body for the ball
	body := chipmunk.NewBodyStatic()
	body.AddShape(ball)
	body.SetPosition(vect.Vect{vect.Float(x), vect.Float(y)})

	ballEntity.body = *body
	return ballEntity
}

func newCircleEntity(x, y, r, m float32) entity {

	// Create a ball
	ballEntity := entity{BasicEntity: ecs.NewBasic()}

	ball := chipmunk.NewCircle(vect.Vector_Zero, r)
	ball.SetElasticity(0.5)

	// everything collides with everything :/
	ball.Layer = -1 // all layers 0xFFFF
	ball.Group = chipmunk.Group(ballEntity.ID())

	// Create a body for the ball
	body := newBody(m, ball)
	body.SetPosition(vect.Vect{vect.Float(x), vect.Float(y)})
	//body.SetAngle(vect.Float(rand.Float32() * 2 * math.Pi))

	ballEntity.body = *body
	return ballEntity
}

func newBody(mass float32, shape *chipmunk.Shape) *chipmunk.Body {
	body := chipmunk.NewBody(vect.Float(mass), shape.Moment(mass))
	body.AddShape(shape)
	return body
}
