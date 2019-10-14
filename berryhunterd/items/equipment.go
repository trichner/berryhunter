package items

import (
	"github.com/trichner/berryhunter/berryhunterd/model"
)

type Equipment map[EquipSlot]Item

func NewEquipment() *Equipment {
	e := make(Equipment)
	return &e
}

func (e Equipment) Equipped() []Item {
	equipped := make([]Item, 0, len(e))
	for _, v := range e {
		equipped = append(equipped, v)
	}
	return equipped
}

func (e Equipment) Equip(p model.PlayerEntity, item Item) {
	e[item.Slot] = item
}

func (e Equipment) Unequip(item Item) {
	delete(e, item.Slot)
}
