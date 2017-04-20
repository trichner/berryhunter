package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
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
	p.entities = make([]physicsEntity,0)
}

func (p *PhysicsSystem) AddBody(b *ecs.BasicEntity,e *chipmunk.Body) {
	p.entities = append(p.entities, physicsEntity{b,e})
	p.space.AddBody(e)
}

func (p *PhysicsSystem) Update(dt float32)  {
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
		p.space.RemoveBody(e)
	}
}
