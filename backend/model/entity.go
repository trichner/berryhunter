package model

import (
	"github.com/trichner/berryhunter/backend/phy"
	"engo.io/ecs"
)

type EntityType uint16

type Bodies []phy.DynamicCollider

type Entity interface {
	Basic() ecs.BasicEntity
	X() float32
	Y() float32
	Angle() float32
	Radius() float32
	Type() EntityType
	AABB() AABB
	Bodies() Bodies
}

type MobVitalSigns struct {
	Health          int
}

type MobEntity interface {
	Entity
	VitalSigns() *MobVitalSigns
	Velocity() phy.Vec2f
}

// AABB is an alias to not expose transitive dependencies
type AABB phy.AABB
