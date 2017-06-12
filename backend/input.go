package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk/vect"
	"log"
	"github.com/trichner/death-io/backend/net"
	"encoding/json"
	"sync"
)

const inputBuffererCount = 3

//---- models for input
type InputDTO struct {
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
	Alt  bool   `json:"alt"`
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
				_ = input
				err := json.Unmarshal(msg.body, &input)
				if err != nil {
					log.Printf("Marshalling Error: %s", err)
				} else {
					i.storeInput(msg.playerId, &input)
				}
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

const walkImpulse = 2.0

// applies the inputs to a player
func (i *InputSystem) UpdatePlayer(p *player, inputs, last *InputDTO) {

	//if last != nil && last.Movement != nil {
	//	l := input2vec(last)
	//	l.Mult(walkImpulse)
	//	p.body.AddForce(float32(-l.X), float32(-l.Y))
	//	return
	//}
	if inputs == nil {
		p.body.SetVelocity(0, 0)
		return
	}

	//p.body.SetMoment(0)
	p.body.SetAngle(vect.Float(inputs.Rotation))

	// do we even have inputs?
	if inputs.Movement == nil {
		p.body.SetVelocity(0, 0)
	} else {
		v := input2vec(inputs)
		v.Mult(walkImpulse)
		p.body.SetVelocity(float32(v.X), float32(v.Y))
	}
}

func input2vec(i *InputDTO) vect.Vect {
	x := signumf32(i.Movement.X)
	y := signumf32(i.Movement.Y)
	// prevent division by zero
	if x == 0 && y == 0 {
		return vect.Vector_Zero
	}
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
	return InputBufferer(make(map[uint64]*InputDTO))
}

type InputBufferer map[uint64]*InputDTO
