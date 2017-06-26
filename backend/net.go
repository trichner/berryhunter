package main

import (
	"engo.io/ecs"
	"log"
	"github.com/google/flatbuffers/go"
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

	// assemble game state prototype
	gameState := GameState{}
	gameState.Tick = n.game.tick
	for _, player := range n.players {

		var entites []Entity

		// find all entities in view
		for c := range player.viewport.Collisions() {
			userData := c.Shape().UserData
			if userData != nil {
				entites = append(entites, userData.(Entity))
			}
		}

		// copy gameStatePrototype
		clientGameState := gameState
		clientGameState.Entities = entites
		clientGameState.Player = player

		// marshal and send state
		builder := flatbuffers.NewBuilder(64)
		gs := clientGameState.MarshalFlatbuf(builder)
		builder.Finish(gs)
		err := player.client.SendMessage(builder.FinishedBytes())
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
