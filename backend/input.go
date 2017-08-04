package main

import (
	"engo.io/ecs"
	"log"
	"sync"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/model/placeable"
)


const inputBuffererCount = 3

//---- models for input

type clientMessage struct {
	playerId uint64
	body     []byte
}

type PlayerInputSystem struct {
	players []*player
	game    *Game
	// currently two, one to read and one to fill
	ibufs [inputBuffererCount]InputBufferer
	mux   sync.Mutex

	receive chan *clientMessage
}

func PlayerInputFlatbufferUnmarshal(bytes []byte) *model.PlayerInput {

	i := &model.PlayerInput{}
	fbInput := DeathioApi.GetRootAsInput(bytes, 0)

	// umarshal simple scalars
	i.Tick = fbInput.Tick()
	i.Rotation = fbInput.Rotation()

	// parse Movement if existing
	m := fbInput.Movement(nil)
	if m != nil {
		i.Movement = &phy.Vec2f{
			X: m.X(),
			Y: m.Y(),
		}
	}

	// parse Action if existent
	a := fbInput.Action(nil)
	if a != nil {
		i.Action = &model.Action{
			Item: items.ItemEnum(a.Item()),
			Type: model.ActionType(a.ActionType()),
		}
	}
	return i
}

func NewInputSystem(g *Game) *PlayerInputSystem {
	return &PlayerInputSystem{game: g}
}

func (i *PlayerInputSystem) Priority() int {
	return 100
}

func (i *PlayerInputSystem) New(w *ecs.World) {

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
				input := PlayerInputFlatbufferUnmarshal(msg.body)
				i.storeInput(msg.playerId, input)
			}
		}
	}()
	log.Println("PlayerInputSystem nominal")
}

func (i *PlayerInputSystem) storeInput(playerId uint64, input *model.PlayerInput) {
	i.mux.Lock()
	i.ibufs[(i.game.tick+1)%inputBuffererCount][playerId] = input
	i.mux.Unlock()
}

func (i *PlayerInputSystem) AddPlayer(p *player) {
	i.players = append(i.players, p)
	p.client.OnMessage(func(c *net.Client, msg []byte) {
		i.receive <- &clientMessage{p.ID(), msg}
	})
}

func (i *PlayerInputSystem) Update(dt float32) {

	// freeze input, concurrent reads are fine
	i.mux.Lock()
	ibuf := i.ibufs[i.game.tick%inputBuffererCount]
	lastBuf := i.ibufs[(i.game.tick+inputBuffererCount-1 )%inputBuffererCount]
	i.mux.Unlock()

	// apply inputs to player
	for _, p := range i.players {
		inputs, _ := ibuf[p.ID()]
		last, _ := lastBuf[p.ID()]
		p.UpdateInput(inputs, last)
	}

	// clear out buffer
	i.mux.Lock()
	i.ibufs[i.game.tick%inputBuffererCount] = NewInputBufferer()
	i.mux.Unlock()
}

const walkSpeed = 0.1

// applies the inputs to a player
func (p *player) UpdateInput(next, last *model.PlayerInput) {

	p.resolveHandCollisions()

	// reset
	p.hand.Shape().Layer = 0

	if next == nil {
		return
	}

	p.SetAngle(next.Rotation)

	// do we even have inputs?
	if next.Movement != nil {

		// we can only move if we are still alive!
		if p.VitalSigns().Health != 0 {
			v := input2vec(next)
			v = v.Mult(walkSpeed)
			next := p.Position().Add(v)
			p.SetPosition(next)
		}

	}

	// process actions if available
	p.applyAction(next.Action)
}

func (p *player) resolveHandCollisions(){
	if p.handItem.ItemDefinition == nil {
		return
	}

	for v := range p.hand.Collisions() {
		usr := v.Shape().UserData
		if usr == nil {
			log.Printf("Missing UserData!")
			continue
		}

		r, ok := usr.(Interacter)
		if !ok {
			log.Printf("Non conformant UserData: %T", usr)
			continue
		}
		r.PlayerHitsWith(p, p.handItem)
	}
}

func (p *player) applyAction(action *model.Action) {

	if action == nil {
		return
	}

	item, err := p.registry.Get(action.Item)
	if err != nil {
		log.Printf("😩 Unknown Action Item: %s", err)
		return
	}

	log.Printf("✊ Action going on: %s(%s)", DeathioApi.EnumNamesActionType[int(action.Type)], item.Name)


	switch action.Type {
	case DeathioApi.ActionTypePrimary:
		if !hasItem(p, item) {
			return
		}
		p.hand.Shape().Layer = -1
		p.handItem = item
		break
	case DeathioApi.ActionTypeCraftItem:
		p.Craft(item)
		break

	case DeathioApi.ActionTypeDropItem:
		if !hasItem(p, item) {
			return
		}
		p.inventory.DropAll(item)
		break

	case DeathioApi.ActionTypeConsumeItem:
		if !hasItem(p, item) {
			return
		}
		ok := p.inventory.ConsumeItem(items.NewItemStack(item, 1))
		if ok {
			h := p.VitalSigns().Health
			h += item.Factors.Food
			p.VitalSigns().Health = h
		}
		break

	case DeathioApi.ActionTypeEquipItem:
		if !hasItem(p, item) {
			return
		}
		p.Equip(item)
		break

	case DeathioApi.ActionTypeUnequipItem:
		if !hasItem(p, item) {
			return
		}
		p.Unequip(item)
		break

	case DeathioApi.ActionTypePlaceItem:
		if item.Type != items.ItemTypePlaceable {

			log.Printf("😠 Tried to place: %s", item.Name)
			return
		}

		hasItem := p.Inventory().ConsumeItem(items.NewItemStack(item, 1))
		if !hasItem {
			return
		}

		log.Printf("🏗 Placing: %s", item.Name)
		// TODO add collision detection

		body := phy.NewCircle(phy.VEC2F_ZERO, 0.5)
		body.Shape().Layer = -1 //TODO
		body.Shape().IsSensor = true // no collison response
		e, err := placeable.NewPlaceable(body, item)
		if err != nil {
			panic(err)
		}
		e.SetPosition(p.Position())
		p.game.AddEntity(e)

		break
	}
}

func hasItem(p model.PlayerEntity, item items.Item) bool {
	// Action item needs to either be in inventory or it's 'None'
	if item.ID != 0 && !p.Inventory().CanConsume(items.NewItemStack(item, 1)) {
		log.Printf("😤 Player tried to use an item he does not own!")
		return false
	}
	return true
}

func input2vec(i *model.PlayerInput) phy.Vec2f {
	x := phy.Signum32f(i.Movement.X)
	y := phy.Signum32f(i.Movement.Y)
	// prevent division by zero
	if x == 0 && y == 0 {
		return phy.Vec2f{}
	}
	v := phy.Vec2f{x, y}
	return v.Normalize()
}

func (i *PlayerInputSystem) Remove(b ecs.BasicEntity) {
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
	return make(InputBufferer)
}

type InputBufferer map[uint64]*model.PlayerInput
