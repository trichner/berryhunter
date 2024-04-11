package model

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
)

func NewBaseEntity(c *phy.Circle, t EntityType) BaseEntity {
	return BaseEntity{BasicEntity: ecs.NewBasic(), Body: c, EntityType: t}
}

var _ = Entity(&BaseEntity{})

type BaseEntity struct {
	ecs.BasicEntity
	Body       *phy.Circle
	EntityType EntityType
}

func (e *BaseEntity) Basic() ecs.BasicEntity {
	return e.BasicEntity
}

func (e *BaseEntity) Bodies() Bodies {
	b := make(Bodies, 1)
	b[0] = e.Body
	return b
}

func (e *BaseEntity) Type() EntityType {
	return e.EntityType
}

func (e *BaseEntity) Position() phy.Vec2f {
	return e.Body.Position()
}

func (e *BaseEntity) SetPosition(p phy.Vec2f) {
	e.Body.SetPosition(p)
}

func (e *BaseEntity) AABB() AABB {
	return AABB(e.Body.BoundingBox())
}

func (e *BaseEntity) Angle() float32 {
	return 0
}

func (e *BaseEntity) Radius() float32 {
	return e.Body.Radius
}
