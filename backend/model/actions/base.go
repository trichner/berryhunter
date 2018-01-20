package actions

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

type baseAction struct {
	item  items.Item
	p     model.PlayerEntity
	ticks int
}

func (b *baseAction) TicksRemaining() int {
	return b.ticks
}

func (b *baseAction) Update(dt float32) {
	b.ticks -= 1
}

func (*baseAction) Start() {
	panic("Method not implemented.")
}

func (*baseAction) Type() model.PlayerActionType {
	panic("WTF?! How did we end up here?")
}