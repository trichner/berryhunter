package model

import (
	"github.com/trichner/berryhunter/backend/phy"
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/mobs"
)

type EntityType uint16

type Bodies []phy.DynamicCollider

type BasicEntity interface {
	Basic() ecs.BasicEntity
}

type BodiedEntity interface {
	BasicEntity
	Position() phy.Vec2f
	SetPosition(phy.Vec2f)
	Bodies() Bodies
}

type Entity interface {
	BodiedEntity

	Radius() float32
	AABB() AABB
	Angle() float32
	Type() EntityType
}

type Heater interface {
	BasicEntity
	HeatRadiation() *HeatRadiator
}

type PlaceableEntity interface {
	Entity

	HeatRadiation() *HeatRadiator
	Item() items.Item
}

type ResourceEntity interface {
	Entity

	Resource() items.Item
	// count
}

type MobEntity interface {
	Entity

	MobID() mobs.MobID
	Health() VitalSign
	//Velocity() phy.Vec2f
	//SetVelocity(v phy.Vec2f)
	Update(dt float32) bool
}

// AABB is an alias to not expose transitive dependencies
type AABB phy.AABB
