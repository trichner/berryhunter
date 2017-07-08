package items

type Equipment struct {
	equipped map[EquipSlot]Item
}

func NewEquipment() Equipment {
	return Equipment{make(map[EquipSlot]Item)}
}

func (e *Equipment) Equip(item Item) {
	e.equipped[item.Slot] = item
}

func (e *Equipment) Unequip(item Item) {
	delete(e.equipped, item.Slot)
}

func (e *Equipment) Equipped() []Item {
	equips := make([]Item, 0, len(e.equipped))
	for _, v := range e.equipped {
		equips = append(equips, v)
	}

	return equips
}
