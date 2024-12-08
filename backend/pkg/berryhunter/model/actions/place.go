package actions

import (
	"log"

	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/placeable"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
)

func NewPlace(i items.Item, p model.PlayerEntity, g model.Game) *Place {
	return &Place{baseAction: baseAction{item: i, p: p}, game: g}
}

var _ = model.PlayerAction(&Place{})

type Place struct {
	baseAction
	game model.Game
}

func (a *Place) Start() {
	item := a.item
	if item.Type != items.ItemTypePlaceable {

		log.Printf("😠 Tried to place: %s", item.Name)
		return
	}

	hasItem := a.p.Inventory().ConsumeItem(items.NewItemStack(item, 1))
	if !hasItem {
		return
	}

	log.Printf("🏗 Placing: %s", item.Name)
	// TODO add collision detection

	var e model.PlaceableEntity = nil
	var err error = nil
	if item.Resource != nil {
		e, err = placeable.NewPlaceableResource(item, *item.Resource)
	} else {
		e, err = placeable.NewPlaceable(item)
	}
	if err != nil {
		log.Printf("Cannot place %s: %s", item.Name, err)
		return
	}

	pp := a.p.Position()
	pos := pp.Add(phy.NewPolarVec2f(0.5, a.p.Angle()))

	e.SetPosition(pos)
	a.game.AddEntity(e)
	a.p.OwnedEntities().Add(e)

	a.ticks = 1
}

func (*Place) Type() model.PlayerActionType {
	return model.PlayerActionPlaceItem
}
