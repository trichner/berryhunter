package main

import (
	"encoding/json"
	"engo.io/ecs"
	"github.com/vova616/chipmunk/vect"
	"log"
	"github.com/trichner/death-io/backend/net"
)

const inputBuffererCount = 3

//---- models for input
type inputDTO struct {
	Tick     *uint64   `json:"tick"`
	Movement *movement `json:"movement"`
	Rotation float32   `json:"rotation"` // [0, 2*PI)
	Action   *action   `json:"action"`
}

type movement struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}

type action struct {
	Item string `json:"item"`
	Alt  bool `json:"alt"`
}

type InputSystem struct {
	players []*player
	game    *Game
	// currently two, one to read and one to fill
	ibufs [inputBuffererCount]InputBufferer
}

func NewInputSystem(g *Game) *InputSystem {
	return &InputSystem{game: g}
}

func (i *InputSystem) Priority() int {
	return 0
}

func (i *InputSystem) New(w *ecs.World) {

	// initialize buffers
	for idx := range i.ibufs {
		i.ibufs[idx] = NewInputBufferer()
	}

	log.Println("InputSystem nominal")
}

func (i *InputSystem) storeInput(clientId uint64, input inputDTO) {
	i.ibufs[(i.game.tick+1)%inputBuffererCount].inputs[clientId] = input
}

func (i *InputSystem) AddPlayer(p *player) {
	i.players = append(i.players, p)
	p.client.OnMessage(func(c *net.Client, msg []byte) {

		var input inputDTO
		err := json.Unmarshal(msg, &input)
		if err != nil {
			log.Printf("Marshalling Error: %s", err)
		} else {
			log.Printf("RX Obj: %+v", input)
			i.storeInput(p.ID(), input)
		}
	})
}

func (i *InputSystem) Update(dt float32) {

	// freeze input
	ibuf := i.ibufs[i.game.tick%inputBuffererCount]
	lastBuf := i.ibufs[(i.game.tick+inputBuffererCount-1 )%inputBuffererCount]

	// apply inputs to player
	for _, p := range i.players {
		inputs, _ := ibuf.inputs[p.ID()]
		last, _ := lastBuf.inputs[p.ID()]
		i.UpdatePlayer(p, &inputs, &last)
	}

	// clear out buffer
	i.ibufs[i.game.tick%inputBuffererCount] = NewInputBufferer()
}

const walkImpulse = 2.0

// applies the inputs to a player
func (i *InputSystem) UpdatePlayer(p *player, inputs, last *inputDTO) {

	//if last != nil && last.Movement != nil {
	//	l := input2vec(last)
	//	l.Mult(walkImpulse)
	//	p.body.AddForce(float32(-l.X), float32(-l.Y))
	//	return
	//}

	// do we even have inputs?
	if inputs == nil || inputs.Movement == nil {
		p.body.SetVelocity(0, 0)
		return
	}

	v := input2vec(inputs)
	v.Mult(walkImpulse)
	p.body.SetVelocity(float32(v.X), float32(v.Y))
}

func input2vec(i *inputDTO) vect.Vect {
	x := signumf32(i.Movement.X)
	y := signumf32(i.Movement.Y)
	v := vect.Vect{X: vect.Float(x), Y: vect.Float(y)}
	v.Normalize()
	return v
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
