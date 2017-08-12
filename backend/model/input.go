package model

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/phy"
)

type PlayerInput struct {
	Tick     uint64
	Movement *phy.Vec2f
	Rotation float32
	Action   *Action
}

type ActionType int

type Action struct {
	Item items.ItemID
	Type ActionType
}
