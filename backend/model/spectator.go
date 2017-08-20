package model

import (
	"github.com/trichner/berryhunter/backend/phy"
)

// Spectator is the interface representing a connected client
// that has not yet joined the game or already died.
type Spectator interface {
	BasicEntity
	Position() phy.Vec2f
	SetPosition(phy.Vec2f)
	Bodies() Bodies
	Viewport() phy.DynamicCollider
	Client() Client
}

