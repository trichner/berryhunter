package main

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

type Interacter interface {
	PlayerHitsWith(p model.PlayerEntity, item items.Item)
}


