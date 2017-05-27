package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"fmt"
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
	*chipmunk.Body
}

type PhysicsSystem struct {
	entities []physicsEntity
	space    *chipmunk.Space
}

func (p *PhysicsSystem) New(w *ecs.World) {
	// do nothing for now
}

func toVect(x, y vect.Float) vect.Vect {
	return vect.Vect{vect.Float(x), vect.Float(y)}
}

func (p *PhysicsSystem) Priority() int {
	return 50
}

func (p *PhysicsSystem) AddBody(b *ecs.BasicEntity, e *chipmunk.Body) {
	pe := physicsEntity{b, e}
	p.entities = append(p.entities, pe)
	p.space.AddBody(pe.Body)
}

func (p *PhysicsSystem) AddPlayer(pl *player) {
	pe := physicsEntity{&pl.BasicEntity, pl.body}
	p.entities = append(p.entities, pe)
	p.space.AddBody(pe.Body)
}

func (p *PhysicsSystem) Update(dt float32) {
	//log.Printf("Physics stepping %f having %d balls\n", dt, len(p.entities))
	p.space.Step(vect.Float(dt))
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
		p.space.RemoveBody(e.Body)
	}
}
