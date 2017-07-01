package main

import "github.com/trichner/berryhunter/backend/items"

type Interacter interface {
	PlayerHitsWith(p *player, item items.Item)
}

type resource struct {
	resource items.Item
}

func (r *resource) PlayerHitsWith(p *player, item items.Item) {
	p.inventory.AddItem(items.NewItemStack(r.resource, 1))
}
