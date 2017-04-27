package main

import (
	"engo.io/ecs"
	"log"
	"encoding/json"
)

type NetSystem struct {
	entities []Entity
	server   *Server
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

func (n *NetSystem) Update(dt float32) {
	log.Printf("Broadcasting %d players", len(n.entities))
	for _, entity := range n.entities {

		dto := mapToDTO(entity)
		msgJson, _ := json.Marshal(dto)
		n.server.Broadcast(&Message{string(msgJson)})
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
