package actions

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

type baseAction struct {
	item items.Item
	p    model.PlayerEntity
}

func (*baseAction) TicksRemaining() int {
	return 1 /* basic actions take exactly one tick */
}

func (*baseAction) Update(dt float32) bool {
	panic("WTF?! How did we end up here?")
}

func (*baseAction) Type() model.PlayerActionType {
	panic("WTF?! How did we end up here?")
}