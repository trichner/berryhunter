package actions

import (
	"log"

	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
)

func hasItem(p model.PlayerEntity, item items.Item) bool {
	// Action item needs to either be in inventory or it's 'None'
	if item.ID != 0 && !p.Inventory().CanConsume(items.NewItemStack(item, 1)) {
		log.Printf("😤 Player tried to use an item he does not own!")
		return false
	}
	return true
}
