package main

import (
	"engo.io/ecs"
	"log"
	"sync"
	"fmt"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/trichner/berryhunter/backend/items"
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

type actionType int

type action struct {
	Item items.ItemEnum
	Type actionType
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
			Item: items.ItemEnum(a.Item()),
			Type: actionType(a.ActionType()),
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

	for v := range p.hand.Collisions() {
		fmt.Printf("HIT!!!! Action on: %+v\n", v.Shape().UserData)
		r, ok := v.Shape().UserData.(Interacter)
		if !ok {
			continue
		}
		r.PlayerHitsWith(p, p.handItem)
	}

	// reset
	p.hand.Shape().Layer = 0

	if inputs == nil {
		return
	}

	p.SetAngle(inputs.rotation)

	// do we even have inputs?
	if inputs.movement != nil {
		v := input2vec(inputs)
		v = v.Mult(walkSpeed)
		next := p.Position().Add(v)
		p.SetPosition(next)

	}

	// process actions if available
	i.applyAction(p, inputs.action)
}

func (i *InputSystem) applyAction(p *player, action *action) {

	if action == nil {
		return
	}

	item, ok := i.game.items.Get(action.Item)
	if !ok {
		fmt.Printf("Unknown Action Item: %d", action.Item)
		return
	}

	switch action.Type {
	case DeathioApi.ActionTypePrimary:
		p.hand.Shape().Layer = -1
		log.Printf("Action going on.")
		log.Printf("Player: %s", p.Position())
		log.Printf("Hand: %s", p.hand.Position())
		break
	case DeathioApi.ActionTypeDropItem:
		p.inventory.DropAll(item)
		break

	case DeathioApi.ActionTypeEquipItem:
		p.Equip(item)
		break

	case DeathioApi.ActionTypeUnequipItem:
		p.Unequip(item)
		break
	}
}

func input2vec(i *InputDTO) phy.Vec2f {
	x := phy.Signum32f(i.movement.X)
	y := phy.Signum32f(i.movement.Y)
	// prevent division by zero
	if x == 0 && y == 0 {
		return phy.Vec2f{}
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
