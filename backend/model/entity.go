package model

import "github.com/trichner/berryhunter/backend/phy"

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

// AABB is an alias to not expose transitive dependencies
type AABB phy.AABB
