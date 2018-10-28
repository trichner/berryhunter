package actions

import (
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"log"
)

func NewCraft(i items.Item, p model.PlayerEntity) *Craft {
	c := &Craft{baseAction: baseAction{item: i, p: p}}
	return c
}

var _ = model.PlayerAction(&Craft{})

type Craft struct {
	baseAction
}

func (c *Craft) Start() {
	def := c.item.ItemDefinition
	if def.Recipe.CraftTicks == 0 {
		log.Printf("😵 Item '%s' has no crafting time!", def.Name)
		return
	}

	if !c.canCraft() {
		log.Printf("😪 Not enough ressources to craft %s.", def.Name)
		return
	}

	// ok, we're good to go, remove materials & craft
	stacks := c.item.Recipe.Materials
	c.p.Inventory().ConsumeItems(stacks)
	c.ticks = def.Recipe.CraftTicks
}

func (c *Craft) Update(dt float32) {
	c.ticks -= 1
	if c.ticks == 0 {
		c.done()
	}
}

func (c *Craft) done() {

	newItem := items.NewSingleItemStack(c.item)
	ok := c.p.Inventory().AddItem(newItem)
	if !ok {
		log.Printf("😳 No space in inventory for %s ?!", c.item.Name)
	}
}

func (c *Craft) canCraft() bool {

	i := c.item
	r := i.Recipe
	inventory := c.p.Inventory()

	// do we have the materials?
	materials := r.Materials
	if !inventory.CanConsumeItems(materials) {
		return false
	}

	// is there any space for the new item?
	newItem := items.NewSingleItemStack(i)

	// can we stack it?
	if inventory.CanConsume(newItem) {
		return true
	}

	// is there an empty slot?
	if inventory.Cap() > inventory.Count() {
		return true
	}

	// is there gonna be an empty slot after crafting?
	inventory = inventory.Copy()
	ok := inventory.ConsumeItems(materials)
	if !ok {
		return false
	}

	if inventory.Cap() > inventory.Count() {
		return true
	}

	return false
}

func (*Craft) Type() model.PlayerActionType {
	return model.PlayerActionCraftItem
}
