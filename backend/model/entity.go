package model

import (
	"github.com/trichner/berryhunter/backend/phy"
	"engo.io/ecs"
)

type EntityType uint16

type Bodies []phy.DynamicCollider

type Entity interface {
	Basic() ecs.BasicEntity
	Position() phy.Vec2f
	Angle() float32
	Radius() float32
	Type() EntityType
	AABB() AABB
	Bodies() Bodies
}

type MobEntity interface {
	Entity
	Health() int
	//Velocity() phy.Vec2f
	//SetVelocity(v phy.Vec2f)
	Update(dt float32)
}

// AABB is an alias to not expose transitive dependencies
type AABB phy.AABB
