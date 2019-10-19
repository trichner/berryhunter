package items

import (
	"fmt"
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"log"
)

const DEFAULT_INVENTORY_CAP = 9

// ItemID represents the ID of the item
type ItemID int

func (i ItemID) String() string {
	return fmt.Sprintf("ItemID(%d)", i)
}

type Inventory struct {
	items        []*ItemStack
	cap          int
	effectEntity effects.EffectEntity
}

func NewInventory(p effects.EffectEntity) Inventory {
	return Inventory{
		effectEntity: p,
		items:        make([]*ItemStack, 0, 10),
		cap:          DEFAULT_INVENTORY_CAP,
	}
}

// ItemStack represents a count of the same items.
// Count should be greater than or equal to 1.
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

func NewSingleItemStack(item Item) *ItemStack {
	return &ItemStack{
		Item:  item,
		Count: 1,
	}
}

func (is *ItemStack) Copy() *ItemStack {
	return NewItemStack(is.Item, is.Count)
}

// Items returns the slice of all items, might contain
// nil elements (empty slots)
func (i *Inventory) Items() []*ItemStack {
	return i.items
}

// Cap returns the maximum amount of item slots
func (i *Inventory) Cap() int {
	return i.cap + i.effectEntity.EffectStack().Factors().InventoryCap
}

// Count returns the number of occupied item slots
func (i *Inventory) Count() int {
	count := 0
	for _, item := range i.items {
		if item != nil {
			count++
		}
	}
	return count
}

// SetCap updates the capacity of the inventory
func (i *Inventory) SetCap(cap int) {
	if cap < i.cap {
		panic("Cannot shrink inventory.")
	}
	i.cap = cap
}

// AddItem adds an ItemStack to the inventory, if the same
// item is already in the inventory the count will be increased,
// otherwise the item will occupy a new slot if there is a free one
// if none is free, the item will not be added and AddItem will return
// false
func (i *Inventory) AddItem(item *ItemStack) (added bool) {

	defer func() {
		if added {
			for n := 0; n < item.Count; n++ {
				i.effectEntity.EffectStack().Add(item.Item.Effects.WhileCarried)
			}
		}
	}()

	if item == nil {
		return false
	}

	// do we already have it?
	for idx, stack := range i.items {
		if stack == nil {
			continue
		}

		if stack.Item == item.Item {
			i.items[idx].Count += item.Count
			return true
		}
	}

	// use a copy to not modify the original drop
	item = item.Copy()

	// find a 'hole' in the inventory
	for idx, stack := range i.items {
		if stack == nil {
			i.items[idx] = item
			return true
		}
	}

	if i.Cap() > len(i.items) {
		i.items = append(i.items, item)
		return true
	}

	return false
}

// CanConsumeItems checks if the provided stacks of items are
// available in the inventory. Returns true if all are present, otherwise
// false
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

// CanConsume checks if an ItemStack is available in the inventory or not.
// Returns true if available, otherwise false.
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

// ConsumeItems removes the provided items from the inventory
// it will skip items that are not available.
// Returns true if all items were consumed, otherwise false.
func (i *Inventory) ConsumeItems(stacks []*ItemStack) bool {

	allConsumed := true
	for _, s := range stacks {
		allConsumed = allConsumed && i.ConsumeItem(s)
	}

	return allConsumed
}

// ConsumeItem removes a single ItemStack from the inventory.
// Returns true if it was available, otherwise false
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

	if hasConsumed {
		err := i.effectEntity.EffectStack().Subtract(stack.Item.Effects.WhileCarried)
		if err != nil {
			log.Printf("Error while dropping (consuming) item %s: %s", stack.Item.Name, err)
		}
	}

	return hasConsumed
}

// DropAll drops all items of the provided kind.
func (i *Inventory) DropAll(item Item) {
	i.iterateItems(item, func(idx int) bool {
		stack := i.items[idx]
		for n := 0; n < stack.Count; n++ {
			err := i.effectEntity.EffectStack().Subtract(stack.Item.Effects.WhileCarried)
			if err != nil {
				log.Printf("Error while dropping (consuming) item %s: %s", stack.Item.Name, err)
			}
		}
		i.items[idx] = nil
		return false
	})
}

// iterateItems is a helper method to iterate over items
func (i *Inventory) iterateItems(itemType Item, p itemStackPredicate) {
	for idx, stack := range i.items {
		if stack != nil && stack.Item.ID == itemType.ID {
			if !p(idx) {
				break
			}
		}
	}
}

// Copy returns a semi-deep copy. It copies the Inventory as well
// as the items entries but not the item definitions
func (i *Inventory) Copy() *Inventory {
	j := NewInventory(i.effectEntity)
	j.cap = i.cap
	for _, s := range i.items {
		j.items = append(j.items, s.Copy())
	}
	return &j
}
