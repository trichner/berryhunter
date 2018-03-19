package sys

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
)

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

func NewPhysicsSystem() *PhysicsSystem {
	return &PhysicsSystem{
		space: phy.NewSpace(),
	}
}

type PhysicsSystem struct {
	entities []physicsEntity
	space    *phy.Space
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
	p.space.AddStaticShape(pe.static)
}

func (p *PhysicsSystem) AddEntity(e model.BodiedEntity) {
	pe := newDyamicPhysicsEntity(e.Basic(), e.Bodies()...)
	p.entities = append(p.entities, pe)
	for _, s := range pe.dynamics {
		p.space.AddShape(s)
	}
}

func (p *PhysicsSystem) Update(dt float32) {
	p.space.Update()
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
				p.space.RemoveShape(d)
			}
		} else {
			panic("Cannot remove static entities!")
		}
	}
}
