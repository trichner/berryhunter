package main

import (
	"engo.io/ecs"
	"log"
	"encoding/json"
	"math/rand"
)

type NetSystem struct {
	entities []*entity
	server   *Server
}

func (n *NetSystem) Priority() int {
	return 0
}

func (n *NetSystem) New(w *ecs.World) {
	log.Println("NetSystem nominal")
}

func (n *NetSystem) AddBody(e *entity) {
	n.entities = append(n.entities, e)
}

func (n *NetSystem) Update(dt float32) {
	log.Printf("Broadcasting %d entities", len(n.entities))
	for _, entity := range n.entities {

		//fx := rand.Float32() * 100.0
		//fy := rand.Float32() * 100.0
		//entity.SetForce(fx, fy)

		entity.AddForce(rand.Float32()*20.0-10.0, rand.Float32()*20.0-10.0)

		dto := mapToDTO(entity)
		msgJson, _ := json.Marshal(dto)
		n.server.Broadcast(&Message{string(msgJson)})
	}
}

func (p *NetSystem) Remove(b ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range p.entities {
		if entity.ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		//e := p.entities[delete]
		p.entities = append(p.entities[:delete], p.entities[delete+1:]...)
	}
}
