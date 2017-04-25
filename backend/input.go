package main

import (
	"engo.io/ecs"
	"log"
	"sync"
)

type action struct {
}

type InputSystem struct {
	entities []*entity
	ibuf     InputBufferer
	server   *Server
}

func (i *InputSystem) Priority() int {
	return 0
}

func (i *InputSystem) New(w *ecs.World) {

	//i.ibuf = &InputBufferer{in}
	log.Println("InputSystem nominal")
	go func() {
		select {
		case msg := <-i.server.rxCh:
			_ = msg


		}
	}()
}

func (n *InputSystem) AddBody(e *entity) {
	n.entities = append(n.entities, e)
}

func (n *InputSystem) Update(dt float32) {

}

func (p *InputSystem) Remove(b ecs.BasicEntity) {
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

func NewInputBufferer() InputBufferer {
	return InputBufferer{inputs: make(map[uint]action)}
}

type InputBufferer struct {
	inputs     map[uint]action
	writeMutex sync.Mutex
}
