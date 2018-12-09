package actions

import (
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/model"
)

func NewPrimary(i items.Item, p model.PlayerEntity) *Primary {
	a := &Primary{baseAction: baseAction{item: i, p: p}}

	a.ticks = 10 // 500ms cooldown
	return a
}

var _ = model.PlayerAction(&Primary{})

type Primary struct {
	baseAction
}

func (p *Primary) Start() {

	if !hasItem(p.p, p.item) {
		return
	}
	p.p.Hand().Collider.Shape().Mask = -1 //TODO fine grained layers
	p.p.Hand().Item = p.item
}

func (*Primary) Type() model.PlayerActionType {
	return model.PlayerActionPrimary
}
