package actions

import (
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/items"
)

func NewPrimary(i items.Item, p model.PlayerEntity) *Primary {
	a := &Primary{baseAction: baseAction{item: i, p: p}}

	a.ticks = 10 // 333ms cooldown
	return a
}

var _ = model.PlayerAction(&Primary{})

type Primary struct {
	baseAction
	ticks int
}

func (p *Primary) TicksRemaining() int {
	return p.ticks
}

func (p *Primary) Start() bool {

	if !hasItem(p.p, p.item) {
		return true
	}
	p.p.Hand().Collider.Shape().Mask = -1 //TODO fine grained layers
	p.p.Hand().Item = p.item
	return false
}

func (p *Primary) Update(dt float32) bool {
	p.ticks -= 1
	return p.ticks <= 0
}

func (*Primary) Type() model.PlayerActionType {
	return model.PlayerActionPrimary
}
