package actions

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

func NewEquip(i items.Item, p model.PlayerEntity) *Equip {
	return &Equip{baseAction: baseAction{item: i, p: p}}
}

var _ = model.PlayerAction(&Equip{})

type Equip struct {
	baseAction
}

func (a *Equip) Start() bool {

	if !hasItem(a.p, a.item) {
		return true
	}
	a.p.Equipment().Equip(a.item)
	return true
}

func (*Equip) Type() model.PlayerActionType {
	return model.PlayerActionEquipItem
}
