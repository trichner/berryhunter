package main

import (
	"engo.io/ecs"
	"log"
	"math/rand"
	"time"
	"github.com/trichner/berryhunter/backend/conf"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
)

func main() {

	config := readConf()

	g := &Game{}
	g.Init(config)

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

const staticBodyGroup = 0x01

var walls []model.Entity = make([]model.Entity, 0)

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

func newStaticCircleEntity(e *entity, p phy.Vec2f, r float32) *entity {

	// Create a ball
	if e == nil {
		e = &entity{BasicEntity: ecs.NewBasic()}
	}

	ball := phy.NewCircle(p, r)
	ball.Shape().UserData = e
	e.body = ball
	return e
}

func newCircleEntity(r float32) *entity {

	aEntity := &entity{BasicEntity: ecs.NewBasic()}
	circle := phy.NewCircle(phy.VEC2F_ZERO, r)

	circle.Shape().UserData = aEntity
	aEntity.body = circle
	return aEntity
}

