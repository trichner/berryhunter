package actions

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

func NewUnequip(i items.Item, p model.PlayerEntity) *Unequip {
	return &Unequip{baseAction: baseAction{item: i, p: p}}
}

var _ = model.PlayerAction(&Unequip{})

type Unequip struct {
	baseAction
}

func (a *Unequip) Start() bool {
	if !hasItem(a.p, a.item) {
		return true
	}
	a.p.Equipment().Unequip(a.item)
	return true
}

func (a *Unequip) Update(dt float32) bool {
	panic("WTF?! How did we end up here?")
}

func (*Unequip) Type() model.PlayerActionType {
	return model.PlayerActionUnequipItem
}
