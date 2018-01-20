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

func (a *Drop) Start() {

	if !hasItem(a.p, a.item) {
		return
	}

	a.p.Inventory().DropAll(a.item)
	a.ticks = 1
}

func (*Drop) Type() model.PlayerActionType {
	return model.PlayerActionDropItem
}
