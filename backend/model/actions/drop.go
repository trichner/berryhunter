package actions

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

func NewDrop(i items.Item, p model.PlayerEntity) *Drop {
	return &Drop{baseAction: baseAction{item: i, p: p}}
}

var _ = model.PlayerAction(&Drop{})

type Drop struct {
	baseAction
}

func (a *Drop) Start() bool {

	if !hasItem(a.p, a.item) {
		return true
	}

	a.p.Inventory().DropAll(a.item)
	return true
}

func (a *Drop) Update(dt float32) bool {
	panic("WTF?! How did we end up here?")
}
