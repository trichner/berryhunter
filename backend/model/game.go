package model

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/mobs"
	"engo.io/ecs"
	"net/http"
)

type Game interface {
	Handler() http.HandlerFunc
	Loop()
	AddEntity(e BasicEntity)
	Update()
	RemoveEntity(e ecs.BasicEntity)

	Items() items.Registry
	Mobs() mobs.Registry
}
