package main

import (
	"engo.io/ecs"
	"log"
	"math/rand"
	"time"
	"github.com/trichner/berryhunter/backend/conf"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/items"
	"sort"
	"os"
	"github.com/trichner/berryhunter/backend/model/mob"
)

func main() {

	config := readConf()
	registry, err := items.RegistryFromPaths("../api/items/")
	if err != nil {

		log.Printf("Error: %s", err)
		os.Exit(1)
	}

	itemList := registry.Items()
	log.Printf("Loaded %d item definitions:", len(itemList))
	sort.Sort(items.ByID(itemList))
	for _, i := range itemList {
		log.Printf("%3d: %s", i.ID, i.Name)
	}

	g := &Game{}
	g.Init(config, registry)

	entities := Generate(g.items, rand.New(rand.NewSource(0xDEADBEEF)))
	for _, e := range entities {
		g.AddEntity(e)
	}

	// add some mobs
	for i := 0; i < 100; i++ {
		m := newMobEntity()
		m.SetPosition(phy.Vec2f{float32(i), float32(i)})
		g.AddEntity(m)
	}

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


func newCircleEntity(r float32) model.BaseEntity {

	aEntity := model.BaseEntity{BasicEntity: ecs.NewBasic()}
	circle := phy.NewCircle(phy.VEC2F_ZERO, r)

	circle.Shape().UserData = aEntity
	aEntity.Body = circle
	return aEntity
}

func newMobEntity() model.MobEntity {
	circle := phy.NewCircle(phy.VEC2F_ZERO, 0.5)
	return mob.NewMob(circle)
}
