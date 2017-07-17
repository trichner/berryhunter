package items

import (
	"fmt"
)

const DEFAULT_INVENTORY_CAP = 8

type ItemEnum int

func (i ItemEnum) String() string {
	return fmt.Sprintf("ItemEnum(%d)", i)
}

type Inventory struct {
	items []*ItemStack
	cap   int
}

func NewInventory() Inventory {
	return Inventory{
		items: make([]*ItemStack, 0, 10),
		cap:   DEFAULT_INVENTORY_CAP,
	}
}

type ItemStack struct {
	Item  Item
	Count int
}

func NewItemStack(item Item, count int) *ItemStack {
	return &ItemStack{
		Item:  item,
		Count: count,
	}
}

func (i *Inventory) Items() []*ItemStack {
	return i.items
}

func (i *Inventory) Cap() int {
	return i.cap
}

func (i *Inventory) SetCap(cap int) {
	if cap < i.cap {
		panic("Cannot shrink inventory.")
	}
	i.cap = cap
}

func (i *Inventory) AddItem(item *ItemStack) bool {

	if item == nil {
		return false
	}

	foundAt := -1
	for idx, stack := range i.items {
		if stack.Item == item.Item {
			foundAt = idx
			break
		}
	}

	// if we already have the same in the Inventory we simply add it
	if foundAt >= 0 {
		i.items[foundAt].Count += item.Count
		return true
	}

	if i.cap > len(i.items) {
		i.items = append(i.items, item)
		return true
	}

	return false
}

func (i *Inventory) CanConsumeItems(stacks []*ItemStack) bool {

	canConsume := true
	for _, s := range stacks {
		canConsume = canConsume && i.CanConsume(s)
		if !canConsume {
			break
		}
	}

	return canConsume
}

func (i *Inventory) CanConsume(stack *ItemStack) bool {

	canConsume := false
	i.iterateItems(stack.Item, func(idx int) bool {
		if i.items[idx].Count >= stack.Count {
			canConsume = true
		}
		return false
	})
	return canConsume
}

type itemStackPredicate func(i int) bool

func (i *Inventory) ConsumeItems(stacks []*ItemStack) bool {

	allConsumed := true
	for _, s := range stacks {
		allConsumed = allConsumed && i.ConsumeItem(s)
	}

	return allConsumed
}

func (i *Inventory) ConsumeItem(stack *ItemStack) bool {

	hasConsumed := false
	i.iterateItems(stack.Item, func(idx int) bool {
		cstack := i.items[idx]
		if cstack.Count >= stack.Count {
			cstack.Count -= stack.Count
			if cstack.Count == 0 {
				i.items[idx] = nil
			}
			hasConsumed = true
		}

		return false
	})

	return hasConsumed
}

func (i *Inventory) DropAll(item Item) {
	i.iterateItems(item, func(idx int) bool {
		i.items[idx] = nil
		return false
	})
}

func (i *Inventory) iterateItems(itemType Item, p itemStackPredicate) {
	for idx, stack := range i.items {
		if stack != nil && stack.Item.ID == itemType.ID {
			if !p(idx) {
				break
			}
		}
	}
}
