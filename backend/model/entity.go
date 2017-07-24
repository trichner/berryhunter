package model

import (
	"github.com/trichner/berryhunter/backend/phy"
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/items"
)

type EntityType uint16

type Bodies []phy.DynamicCollider

type Entity interface {
	Basic() ecs.BasicEntity
	Position() phy.Vec2f
	SetPosition(phy.Vec2f)
	Radius() float32
	AABB() AABB
	Bodies() Bodies

	Angle() float32
	Type() EntityType
}

type ResourceEntity interface {
	Entity

	Resource() items.Item
}

type MobEntity interface {
	Entity

	Health() int
	//Velocity() phy.Vec2f
	//SetVelocity(v phy.Vec2f)
	Update(dt float32) bool
}

// AABB is an alias to not expose transitive dependencies
type AABB phy.AABB
