package model

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/mobs"
	"engo.io/ecs"
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

	// Items returns the registry with all available item definitions
	Items() items.Registry

	// Mobs returns the registry with all available mob definitions
	Mobs() mobs.Registry
}
