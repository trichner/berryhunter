package actions

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"log"
)

func NewCraft(i items.Item, p model.PlayerEntity) *Craft {
	c := &Craft{baseAction: baseAction{item: i, p: p}}
	return c
}

var _ = model.PlayerAction(&Craft{})

type Craft struct {
	baseAction
	ticks int
}

func (c *Craft) Ticks() int {
	return c.ticks
}

func (c *Craft) Start() bool {
	def := c.item.ItemDefinition
	if def.Recipe.CraftTicks == 0 {
		log.Printf("😵 Item '%s' has no crafting time!", def.Name)
		return true
	}

	if !c.canCraft() {
		log.Printf("😪 Not enough ressources to craft %s.", def.Name)
		return true
	}

	// ok, we're good to go, remove materials & craft
	stacks := c.item.Recipe.Materials
	c.p.Inventory().ConsumeItems(stacks)
	c.ticks = def.Recipe.CraftTicks

	return false
}

func (c *Craft) Update(dt float32) bool {
	c.ticks -= 1
	if c.ticks == 0 {
		c.done()
	}
	return c.ticks <= 0
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

	materials := r.Materials
	if !inventory.CanConsumeItems(materials) {
		return false
	}

	// check if there is space in the inventory
	newItem := items.NewSingleItemStack(i)
	if (!inventory.CanConsume(newItem)) && inventory.Cap() == inventory.Count() {
		return false
	}

	return true
}
