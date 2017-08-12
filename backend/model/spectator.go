package model

import (
	"github.com/trichner/berryhunter/backend/phy"
)

type Spectator interface {
	BasicEntity
	Position() phy.Vec2f
	SetPosition(phy.Vec2f)
	Bodies() Bodies
	Viewport() phy.DynamicCollider
	Client() Client
}

