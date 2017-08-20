package model

import (
	"github.com/trichner/berryhunter/backend/items"
)

type Interacter interface {
	PlayerHitsWith(p PlayerEntity, item items.Item)
}
