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

func (a *Primary) Start() bool {

	if !hasItem(a.p, a.item) {
		return true
	}
	a.p.Hand().Collider.Shape().Layer = -1 //TODO fine grained layers
	a.p.Hand().Item = a.item
	return false
}

func (a *Primary) Update(dt float32) bool {
	a.ticks -= 1
	return a.ticks <= 0
}
