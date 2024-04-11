package model

import (
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
)

type Interacter interface {
	PlayerHitsWith(p PlayerEntity, item items.Item)
}
