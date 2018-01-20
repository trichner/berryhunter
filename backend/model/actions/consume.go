package actions

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

func NewConsume(i items.Item, p model.PlayerEntity) *Consume {
	return &Consume{baseAction: baseAction{item: i, p: p}}
}

var _ = model.PlayerAction(&Consume{})

type Consume struct {
	baseAction
}

func (a *Consume) Start() bool {

	p := a.p
	if !hasItem(p, a.item) {
		return true
	}
	ok := p.Inventory().ConsumeItem(items.NewItemStack(a.item, 1))
	if ok {
		// prevent overflow
		h := p.VitalSigns().Satiety
		foodFraction := a.item.Factors.Food
		p.VitalSigns().Satiety = h.AddFraction(foodFraction)
	}
	return true
}

func (*Consume) Type() model.PlayerActionType {
	return model.PlayerActionConsumeItem
}

