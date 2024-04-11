package actions

import (
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
)

func NewConsume(i items.Item, p model.PlayerEntity) *Consume {
	return &Consume{baseAction: baseAction{item: i, p: p}}
}

var _ = model.PlayerAction(&Consume{})

type Consume struct {
	baseAction
}

func (a *Consume) Start() {

	p := a.p
	if !hasItem(p, a.item) {
		return
	}

	ok := p.Inventory().ConsumeItem(items.NewItemStack(a.item, 1))
	if ok {
		// prevent overflow
		h := p.VitalSigns().Satiety
		foodFraction := a.item.Factors.Food
		p.VitalSigns().Satiety = h.AddFraction(foodFraction)
	}
	a.ticks = 1
}

func (*Consume) Type() model.PlayerActionType {
	return model.PlayerActionConsumeItem
}
