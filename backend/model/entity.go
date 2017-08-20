package model

import (
	"github.com/trichner/berryhunter/backend/phy"
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/mobs"
)

// EntityType is an enum describing the type of the entity
// it is no longer essential in all cases as most of the information
// is in the type itself
type EntityType uint16

// Bodies is a list of physical bodies that may be added to the
// collision engine
type Bodies []phy.DynamicCollider

// BasicEntity is an entity that at least embeds
// the ecs.BasicEntity. Therefore it can be removed
// from the game if necessary
type BasicEntity interface {
	Basic() ecs.BasicEntity
}

// BodiedEntiy is an entity with physical bodies and
// a dynamic position
type BodiedEntity interface {
	BasicEntity
	Position() phy.Vec2f
	SetPosition(phy.Vec2f)
	Bodies() Bodies
}

// Entity is a general game object.
type Entity interface {
	BodiedEntity

	Radius() float32
	AABB() AABB
	Angle() float32
	Type() EntityType
}

// Heater is an entity that radiates heat
type Heater interface {
	BasicEntity
	HeatRadiation() *HeatRadiator
}

// PlaceableEntity is an entity that was
// dynamically placed and might need constant updates
type PlaceableEntity interface {
	Entity

	Decayed() bool
	Update(dt float32)
	HeatRadiation() *HeatRadiator
	Item() items.Item
}

// ResourceEntity is an entity that can be mined/gathered
type ResourceEntity interface {
	Entity

	Resource() items.Item
	// count
}

// MobEnity is a mob that usually comes with a mob definition
// and also needs constant updates since it might move/have an AI
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
