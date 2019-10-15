package items

import (
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"log"
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

func (e Equipment) Equip(p effects.EffectEntity, item Item) {
	e.unequipItemInSlot(p, item.Slot)
	p.EffectStack().Add(item.Effects.WhileEquipped)
	e[item.Slot] = item
}

func (e Equipment) Unequip(p effects.EffectEntity, item Item) {
	e.unequipItemInSlot(p, item.Slot)
	delete(e, item.Slot)
}

func (e Equipment) unequipItemInSlot(p effects.EffectEntity, slot EquipSlot) {
	if curItem, ok := e[slot]; ok {
		err := p.EffectStack().Subtract(curItem.Effects.WhileEquipped)
		if err != nil {
			log.Printf("Error while unequipping item %s: %s", curItem.Name, err)
		}
	}
}
