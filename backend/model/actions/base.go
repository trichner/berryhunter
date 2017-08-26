package actions

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

type baseAction struct {
	item items.Item
	p    model.PlayerEntity
}

func (a *baseAction) Update(dt float32) bool {
	panic("WTF?! How did we end up here?")
}
