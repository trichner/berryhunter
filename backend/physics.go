package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
	"fmt"
	"github.com/trichner/berryhunter/backend/phy"
)

const (
	noneCollisionLayer      = 0
	allCollisionLayer       = -1
	staticCollisionLayer    = 0x1 << 0
	actionCollisionLayer    = 0x1 << 1
	weaponCollisionLayer    = 0x1 << 2
	ressourceCollisionLayer = 0x1 << 3
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
	*ecs.BasicEntity
	static  phy.Collider
	dynamic phy.DynamicCollider
}

type PhysicsSystem struct {
	entities []physicsEntity
	game     *Game
}

func (p *PhysicsSystem) New(w *ecs.World) {
	// do nothing for now
}

func (p *PhysicsSystem) Priority() int {
	return 50
}

func (p *PhysicsSystem) AddStaticBody(b *ecs.BasicEntity, e phy.Collider) {
	pe := physicsEntity{b, e, nil}
	p.entities = append(p.entities, pe)
	p.game.space.AddStaticShape(pe.static)
}

func (p *PhysicsSystem) AddBody(b *ecs.BasicEntity, e phy.DynamicCollider) {
	pe := physicsEntity{b, nil, e}
	p.entities = append(p.entities, pe)
	p.game.space.AddShape(pe.dynamic)
}

func (p *PhysicsSystem) AddPlayer(pl *player) {
	pe := physicsEntity{&pl.BasicEntity, nil, pl.body}
	p.entities = append(p.entities, pe)
	p.game.space.AddShape(pe.dynamic)
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
		if e.dynamic != nil {
			p.game.space.RemoveShape(e.dynamic)
		}else{
			panic("Cannot remove static entities!")
		}
	}
}
