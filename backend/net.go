package main

import (
	"engo.io/ecs"
	"log"
	"encoding/json"
)

type NetSystem struct {
	entities []Entity
	players  []*player
	game     *Game
}

func NewNetSystem(g *Game) *NetSystem {
	//TODO configure path/ports here
	return &NetSystem{game: g}
}

func (n *NetSystem) Priority() int {
	return 0
}

func (n *NetSystem) New(w *ecs.World) {
	log.Println("NetSystem nominal")
}

func (n *NetSystem) AddEntity(e Entity) {
	n.entities = append(n.entities, e)
}

func (n *NetSystem) AddPlayer(p *player) {
	n.AddEntity(p)
	n.players = append(n.players, p)
}

func (n *NetSystem) Update(dt float32) {
	log.Printf("Broadcasting %d players", len(n.entities))

	var entites []*EntityDTO
	for _, entity := range n.entities {

		dto := mapToEntityDTO(entity)
		entites = append(entites, dto)

		//DEPRECATED
		//msg := &MessageDTO{"OBJECT", dto}
		//msgJson, _ := json.Marshal(msg)
		//n.game.server.Broadcast(&Message{string(msgJson)})
	}

	// assemble game state prototype
	gameState := GameStateDTO{}
	gameState.Tick = n.game.tick
	gameState.Entities = entites
	//TODO assemble to a 'GameStateDTO' object and send every player his state
	for _, player := range n.players {
		_ = player
		//TODO
		// - query BB for entities in view

		// copy gameStatePrototype
		clientGameState := gameState
		clientGameState.PlayerID = player.ID()
		msg := &MessageDTO{"GAME_STATE", clientGameState}
		msgJson, _ := json.Marshal(msg)
		err := player.client.Tx(&Message{string(msgJson)})
		if err != nil {
			n.game.RemoveEntity(player.BasicEntity)
		}
	}
}

func (n *NetSystem) Remove(b ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range n.entities {
		if entity.ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		//e := p.players[delete]
		n.entities = append(n.entities[:delete], n.entities[delete+1:]...)
	}
}
