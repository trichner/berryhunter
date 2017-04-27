package main

import (
	"engo.io/ecs"
	"log"
	"github.com/vova616/chipmunk/vect"
	"encoding/json"
)

/*
   {
   	"tick":1337,
   	"movement":"TOP_RIGHT",
   	"action":{
  		"item":"FIST"
   	}
   }
 */

const inputBuffererCount = 2

type inputDTO struct {
	tick     uint64 `json:"tick"`
	movement movement `json:"movement"` // BOTTOM BOTTOM_LEFT BOTTOM_RIGHT
	rotation float32 `json:"rotation"`  // [0, 2*PI)
	action   action `json:"action"`
}

type movement struct {
	x float32 `json:"x"`
	y float32 `json:"y"`
}

type action struct {
	item string `json:"item"`
}

type InputSystem struct {
	players []*player
	game    *Game

	ibufs [inputBuffererCount]InputBufferer
}

func NewInputSystem(g *Game) *InputSystem {
	return &InputSystem{game: g}
}

func (i *InputSystem) Priority() int {
	return 0
}

func (i *InputSystem) New(w *ecs.World) {

	for idx := range i.ibufs {
		i.ibufs[idx] = InputBufferer{make(map[uint64]inputDTO)}
	}

	log.Println("InputSystem nominal")
	go func() {
		for {
			select {
			case msg := <-i.game.server.rxCh:
				log.Printf("Received 1 message from %d", msg.client.id)

				var input inputDTO
				err := json.Unmarshal([]byte(msg.body.body), &input)
				if err != nil {
					log.Printf("Marshalling Error: %s", err)
				} else {
					i.ibufs[(i.game.tick+1)%inputBuffererCount].inputs[msg.client.id] = input
				}
			}
		}
	}()
}

func (i *InputSystem) AddPlayer(p *player) {
	i.players = append(i.players, p)
}

func (i *InputSystem) Update(dt float32) {

	// freeze input
	ibuf := i.ibufs[i.game.tick%inputBuffererCount]
	for _, p := range i.players {

		inputs, ok := ibuf.inputs[p.client.id]
		if (!ok) {
			p.body.SetVelocity(0, 0)
			continue
		}

		v := vect.Vect{X: vect.Float(inputs.movement.x), Y: vect.Float(inputs.movement.y)}
		v.Normalize()
		v.Mult(10.0)
		p.body.SetVelocity(float32(v.X), float32(v.Y))
	}

}

func (i *InputSystem) Remove(b ecs.BasicEntity) {
	var delete int = -1
	for index, player := range i.players {
		if player.ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		//e := p.players[delete]
		i.players = append(i.players[:delete], i.players[delete+1:]...)
	}
}

func NewInputBufferer() InputBufferer {
	return InputBufferer{inputs: make(map[uint64]inputDTO)}
}

type InputBufferer struct {
	inputs map[uint64]inputDTO
}
