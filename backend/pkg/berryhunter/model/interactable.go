package model

import (
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
)

type Interacter interface {
	PlayerHitsWith(p PlayerEntity, item items.Item)
	MobTouches(m MobEntity, factors mobs.Factors)
}
