package model

import (
	"github.com/trichner/berryhunter/berryhunterd/items"
)

type Interacter interface {
	PlayerHitsWith(p PlayerEntity, item items.Item)
}
