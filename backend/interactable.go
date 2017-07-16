package main

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

type Interacter interface {
	PlayerHitsWith(p model.PlayerEntity, item items.Item)
}

type resource struct {
	resource items.Item
}

func (r *resource) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	p.Inventory().AddItem(items.NewItemStack(r.resource, 1))
}
