package model

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/phy"
)

type BaseEntity struct {
	ecs.BasicEntity
	Body       *phy.Circle
	EntityType EntityType
}

func (e *BaseEntity) Type() EntityType {
	return e.EntityType
}

func (e *BaseEntity) SetPosition(x, y float32) {
	e.Body.SetPosition(phy.Vec2f{x, y})
}

func (e *BaseEntity) X() float32 {
	return e.Body.Position().X
}

func (e *BaseEntity) Y() float32 {
	return e.Body.Position().Y
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
