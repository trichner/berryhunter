package actions

import (
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/berryhunterd/model/placeable"
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"log"
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

	a.p.EffectStack().Add(item.Effects.OnPlacing)

	// TODO add collision detection

	factors := a.p.EffectStack().Factors()
	bonus := struct {
		DurationInTicks int
		HeatRadius      float32
		HeatPerTick     uint32
	}{
		DurationInTicks: factors.DurationInTicks,
		HeatRadius:      factors.HeatRadius,
		HeatPerTick:     factors.HeatPerTick,
	}
	e, err := placeable.NewPlaceable(item, bonus)

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
