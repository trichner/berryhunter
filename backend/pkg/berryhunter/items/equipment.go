package items

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

func (e Equipment) Equip(item Item) {
	e[item.Slot] = item
}

func (e Equipment) Unequip(item Item) {
	delete(e, item.Slot)
}
