package main

import "github.com/trichner/berryhunter/backend/items"

type Interacter interface {
	PlayerHitsWith(p *player, item items.ItemEnum)
}

type resource struct {
	resource items.ItemEnum
}

func (r *resource) PlayerHitsWith(p *player, item items.ItemEnum) {
	p.inventory.AddItem(items.NewItemStack(r.resource, 1))
}
