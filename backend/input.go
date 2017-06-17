package main

import (
	"engo.io/ecs"
	"log"
	"github.com/trichner/death-io/backend/net"
	"sync"
	"github.com/trichner/death-io/backend/DeathioApi"
	"fmt"
	"github.com/trichner/death-io/backend/phy"
)


const inputBuffererCount = 3

//---- models for input
type InputDTO struct {
	tick     uint64
	movement *movement
	rotation float32
	action   *action
}

type movement struct {
	X, Y float32
}

type action struct {
	Item byte
}

type clientMessage struct {
	playerId uint64
	body     []byte
}

type InputSystem struct {
	players []*player
	game    *Game
	// currently two, one to read and one to fill
	ibufs [inputBuffererCount]InputBufferer
	mux   sync.Mutex

	receive chan *clientMessage
}

func (i *InputDTO) FlatbufferUnmarshal(bytes []byte) {

	fbInput := DeathioApi.GetRootAsInput(bytes, 0)

	// umarshal simple scalars
	i.tick = fbInput.Tick()
	i.rotation = fbInput.Rotation()

	// parse movement if existing
	m := fbInput.Movement(nil)
	if m != nil {
		i.movement = &movement{
			X: m.X(),
			Y: m.Y(),
		}
	}

	// parse action if existent
	a := fbInput.Action(nil)
	if a != nil {
		i.action = &action{
			Item: a.Item(),
		}
	}
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
	i.receive = make(chan *clientMessage, 256)

	// receive pump, otherwise we have concurrent map writes
	go func() {
		for {
			select {
			case msg := <-i.receive:
				var input InputDTO
				input.FlatbufferUnmarshal(msg.body)
				i.storeInput(msg.playerId, &input)
			}
		}
	}()
	log.Println("InputSystem nominal")
}

func (i *InputSystem) storeInput(playerId uint64, input *InputDTO) {
	i.mux.Lock()
	i.ibufs[(i.game.tick+1)%inputBuffererCount][playerId] = input
	i.mux.Unlock()
}

func (i *InputSystem) AddPlayer(p *player) {
	i.players = append(i.players, p)
	p.client.OnMessage(func(c *net.Client, msg []byte) {
		i.receive <- &clientMessage{p.ID(), msg}
	})
}

func (i *InputSystem) Update(dt float32) {

	// freeze input, concurrent reads are fine
	i.mux.Lock()
	ibuf := i.ibufs[i.game.tick%inputBuffererCount]
	lastBuf := i.ibufs[(i.game.tick+inputBuffererCount-1 )%inputBuffererCount]
	i.mux.Unlock()

	// apply inputs to player
	for _, p := range i.players {
		inputs, _ := ibuf[p.ID()]
		last, _ := lastBuf[p.ID()]
		i.UpdatePlayer(p, inputs, last)
	}

	// clear out buffer
	i.mux.Lock()
	i.ibufs[i.game.tick%inputBuffererCount] = NewInputBufferer()
	i.mux.Unlock()
}

const walkSpeed = 0.1

// applies the inputs to a player
func (i *InputSystem) UpdatePlayer(p *player, inputs, last *InputDTO) {

	if inputs == nil {
		return
	}

	p.angle = inputs.rotation

	// do we even have inputs?
	if inputs.movement != nil {
		v := input2vec(inputs)
		v = v.Mult(walkSpeed)
		next := p.body.Position().Add(v)
		p.body.SetPosition(next)
	}

	// process actions if available
	if inputs.action != nil {
		//a := inputs.action
		for _, v := range p.collisions {
			fmt.Printf("Action on: %+v\n", v)
		}
	} else {
		//p.body.CallbackHandler = nil
	}
}

func input2vec(i *InputDTO) phy.Vec2f {
	x := signumf32(i.movement.X)
	y := signumf32(i.movement.Y)
	// prevent division by zero
	if x == 0 && y == 0 {
		return phy.VEC2F_ZERO
	}
	v := phy.Vec2f{x, y}
	return v.Normalize()
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
	return InputBufferer(make(map[uint64]*InputDTO))
}

type InputBufferer map[uint64]*InputDTO
