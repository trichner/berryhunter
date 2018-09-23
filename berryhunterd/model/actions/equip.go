package actions

import (
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/model"
)

func NewEquip(i items.Item, p model.PlayerEntity) *Equip {
	return &Equip{baseAction: baseAction{item: i, p: p}}
}

var _ = model.PlayerAction(&Equip{})

type Equip struct {
	baseAction
}

func (a *Equip) Start() {

	if !hasItem(a.p, a.item) {
		return
	}
	a.p.Equipment().Equip(a.item)
	a.ticks = 1
}

func (*Equip) Type() model.PlayerActionType {
	return model.PlayerActionEquipItem
}
