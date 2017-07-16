package model

import (
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/items"
)

type EntityType uint16

type Entity interface {
	ID() uint64
	X() float32
	Y() float32
	Angle() float32
	Radius() float32
	Type() EntityType
	AABB() AABB
}

type PlayerEntity interface {
	Entity
	Name() string
	Equipped() []items.Item
}

// AABB is an alias to not expose transitive dependencies
type AABB phy.AABB
