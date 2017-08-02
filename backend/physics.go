package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
	"fmt"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
)

func DumpBodies(s *chipmunk.Space) {
	fmt.Printf("x, y, w, h\n")
	for _, b := range s.Bodies {
		dumpBody(b)
	}

	bb := chipmunk.NewAABB(-110, -110, 110, 110)
	s.QueryStatic(nil, bb, func(a, b chipmunk.Indexable) {
		dumpBody(b.Shape().Body)
	})
}

func dumpBody(b *chipmunk.Body) {
	//	pos := b.Position()
	for _, s := range b.Shapes {
		bb := s.AABB()
		v := bb.Upper
		v.Sub(bb.Lower)
		fmt.Printf("%f,%f,%f,%f\n", bb.Lower.X, bb.Lower.Y, v.X, v.Y)
	}
}

type physicsEntity struct {
	ecs.BasicEntity
	static   phy.Collider
	dynamics []phy.DynamicCollider
}

func newStaticPhysicsEntity(e ecs.BasicEntity, c phy.Collider) *physicsEntity {
	return &physicsEntity{e, c, nil}
}

func newDyamicPhysicsEntity(e ecs.BasicEntity, colliders ...phy.DynamicCollider) physicsEntity {
	dynamics := make([]phy.DynamicCollider, 0, 2)
	for _, d := range colliders {
		dynamics = append(dynamics, d)
	}
	return physicsEntity{e, nil, dynamics}
}

type PhysicsSystem struct {
	entities []physicsEntity
	game     *Game
}

func (p *PhysicsSystem) New(w *ecs.World) {
	// do nothing for now
}

func (p *PhysicsSystem) Priority() int {
	return 0
}

func (p *PhysicsSystem) AddStaticBody(b ecs.BasicEntity, e phy.Collider) {
	pe := physicsEntity{b, e, nil}
	p.entities = append(p.entities, pe)
	p.game.space.AddStaticShape(pe.static)
}

func (p *PhysicsSystem) AddEntity(e model.Entity) {
	pe := newDyamicPhysicsEntity(e.Basic(), e.Bodies()...)
	p.entities = append(p.entities, pe)
	for _, s := range pe.dynamics {
		p.game.space.AddShape(s)
	}
}

func (p *PhysicsSystem) Update(dt float32) {
	//log.Printf("Physics stepping %f having %d balls\n", dt, len(p.entities))
	p.game.space.Update()
}

func (p *PhysicsSystem) Remove(b ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range p.entities {
		if entity.ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		e := p.entities[delete]
		p.entities = append(p.entities[:delete], p.entities[delete+1:]...)
		if e.dynamics != nil {
			for _, d := range e.dynamics {
				p.game.space.RemoveShape(d)
			}
		}else{
			panic("Cannot remove static entities!")
		}
	}
}
