package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"log"
)

type physicsEntity struct {
	*ecs.BasicEntity
	*chipmunk.Body
}

type PhysicsSystem struct {
	entities []physicsEntity
	space *chipmunk.Space
}

func (p *PhysicsSystem) New(w *ecs.World){
	// do nothing for now
}

func (p *PhysicsSystem) AddBody(b *ecs.BasicEntity,e *chipmunk.Body) {
	pe := physicsEntity{b,e}
	p.entities = append(p.entities, pe)
	p.space.AddBody(pe.Body)
}

func (p *PhysicsSystem) Update(dt float32)  {
	log.Printf("Physics stepping %f having %d balls\n", dt, len(p.entities))
	p.space.Step(vect.Float(dt))
}

func (p *PhysicsSystem) Remove(b ecs.BasicEntity)  {
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
