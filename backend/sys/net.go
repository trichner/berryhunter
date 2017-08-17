package sys

import (
	"engo.io/ecs"
	"log"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/codec"
)

type NetSystem struct {
	entities   []model.Entity
	players    []model.PlayerEntity
	spectators []model.Spectator
	game       *Game
}

func NewNetSystem(g *Game) *NetSystem {
	//TODO configure path/ports here
	return &NetSystem{game: g}
}

func (n *NetSystem) Priority() int {
	return -100
}

func (n *NetSystem) New(w *ecs.World) {
	log.Println("NetSystem nominal")
}

func (n *NetSystem) AddEntity(e model.Entity) {
	n.entities = append(n.entities, e)
}

func (n *NetSystem) AddPlayer(p model.PlayerEntity) {
	n.AddEntity(p)
	n.players = append(n.players, p)
}

func (n *NetSystem) AddSpectator(s model.Spectator) {
	n.spectators = append(n.spectators, s)
}

func (n *NetSystem) Update(dt float32) {

	// assemble game state prototype
	characterGameState := codec.CharacterGameState{}
	characterGameState.Tick = n.game.Tick

	// process players
	for _, player := range n.players {
		n.playerSendState(player, characterGameState)
	}

	// assemble game state prototype
	spectatorGameState := codec.SpectatorGameState{}
	spectatorGameState.Tick = n.game.Tick

	// process players
	for _, spectator := range n.spectators {
		n.spectatorSendState(spectator, spectatorGameState)
	}
}

func (n *NetSystem) playerSendState(p model.PlayerEntity, gs codec.CharacterGameState) {

	var entities []model.Entity

	// find all entities in view
	for c := range p.Viewport().Collisions() {
		userData := c.Shape().UserData
		if userData != nil {
			entities = append(entities, userData.(model.Entity))
		}
	}

	// copy gameStatePrototype
	gs.Entities = entities
	gs.Player = p

	// marshal and send state
	builder := flatbuffers.NewBuilder(64)
	msg := codec.CharacterGameStateMessageMarshalFlatbuf(builder, &gs)
	builder.Finish(msg)

	err := p.Client().SendMessage(builder.FinishedBytes())
	if err != nil {
		n.game.RemoveEntity(p.Basic())
	}
}

func (n *NetSystem) spectatorSendState(s model.Spectator, gs codec.SpectatorGameState) {

	var entities []model.Entity

	// find all entities in view
	for c := range s.Viewport().Collisions() {
		userData := c.Shape().UserData
		if userData != nil {
			entities = append(entities, userData.(model.Entity))
		}
	}

	// copy gameStatePrototype
	gs.Entities = entities
	gs.Spectator = s

	// marshal and send state
	builder := flatbuffers.NewBuilder(64)
	msg := codec.SpectatorGameStateMessageMarshalFlatbuf(builder, &gs)
	builder.Finish(msg)

	err := s.Client().SendMessage(builder.FinishedBytes())
	if err != nil {
		n.game.RemoveEntity(s.Basic())
	}
}

func (n *NetSystem) Remove(b ecs.BasicEntity) {
	var delete int

	// delete from entitites
	delete = -1
	for index, entity := range n.entities {
		if entity.Basic().ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		n.entities = append(n.entities[:delete], n.entities[delete+1:]...)
	}

	// delete from players
	delete = -1
	for index, entity := range n.players {
		if entity.Basic().ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		n.players = append(n.players[:delete], n.players[delete+1:]...)
	}

	// delete from spectators
	delete = -1
	for index, entity := range n.spectators {
		if entity.Basic().ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		n.spectators = append(n.spectators[:delete], n.spectators[delete+1:]...)
	}
}
