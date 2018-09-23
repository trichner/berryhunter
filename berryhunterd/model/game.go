package model

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/berryhunterd/cfg"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/items/mobs"
	"net/http"
)

type Game interface {
	// Handler returns a http request HandlerFunc that upgrades
	// requests to a websocket connection and starts the game protocol
	Handler() http.HandlerFunc

	// Loop starts and runs the games loop tick per tick
	Loop()

	// AddEntity adds an entity to the game
	AddEntity(e BasicEntity)

	// RemoveEntity removes an entity from the game
	RemoveEntity(e ecs.BasicEntity)

	// Finds an entity by its id
	GetEntity(id uint64) (BasicEntity, error)

	// Items returns the registry with all available item definitions
	Items() items.Registry

	// Mobs returns the registry with all available mob definitions
	Mobs() mobs.Registry

	// Ticks returns the number of ticks
	Ticks() uint64

	// Radius returns the radius of the map
	Radius() float32

	Config() *cfg.GameConfig
}
