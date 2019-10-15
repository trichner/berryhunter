package actions

import (
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/model"
)

func NewUnequip(i items.Item, p model.PlayerEntity) *Unequip {
	return &Unequip{baseAction: baseAction{item: i, p: p}}
}

var _ = model.PlayerAction(&Unequip{})

type Unequip struct {
	baseAction
}

func (a *Unequip) Start() {
	if !hasItem(a.p, a.item) {
		return
	}
	a.p.Equipment().Unequip(a.p, a.item)
	a.ticks = 1
}

func (*Unequip) Type() model.PlayerActionType {
	return model.PlayerActionUnequipItem
}
