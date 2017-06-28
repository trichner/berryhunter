package main

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/items"
)

type InventorySystem struct {
	inventories []*inventoryEntity
}

type inventoryEntity struct {
	basic     *ecs.BasicEntity
	inventory *items.Inventory
}

func (*InventorySystem) New(w *ecs.World) {
	// do nothing for now
}

func (*InventorySystem) Priority() int {
	return 50
}

func (is *InventorySystem) AddInventory(e *ecs.BasicEntity, i *items.Inventory) {
	ie := &inventoryEntity{e, i}
	is.inventories = append(is.inventories, ie)
}

func (is *InventorySystem) Update(dt float32) {
	//log.Printf("Physics stepping %f having %d balls\n", dt, len(p.entities))

	for _, i := range is.inventories {
		_ = i
		//itemToAdd := i.inventory.

		//inInventory := false
		//for _, stack := range i.inventory.items {
		//	if stack.item == itemToAdd.item {
		//		inInventory = true
		//		return
		//	}
		//}

		//TODO
	}

}

func (is *InventorySystem) Remove(b ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range is.inventories {
		if entity.basic.ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		is.inventories = append(is.inventories[:delete], is.inventories[delete+1:]...)
	}
}
