package core

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"log"
	"github.com/trichner/berryhunter/backend/model/actions"
)

const inputBuffererCount = 3

//---- models for input

type clientMessage struct {
	playerId uint64
	body     []byte
}

type PlayerInputSystem struct {
	players model.Players
	game    *game
	// currently two, one to read and one to fill
	ibufs [inputBuffererCount]InputBufferer
}

func NewInputSystem(g *game) *PlayerInputSystem {
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
	log.Println("PlayerInputSystem nominal")
}

func (i *PlayerInputSystem) storeInput(playerId uint64, input *model.PlayerInput) {
	i.ibufs[i.game.Tick%inputBuffererCount][playerId] = input
}

func (i *PlayerInputSystem) AddPlayer(p model.PlayerEntity) {
	i.players = append(i.players, p)
}

func (i *PlayerInputSystem) Update(dt float32) {

	// get all inputs
	for _, p := range i.players {
		input := p.Client().NextInput()
		if input != nil {
			i.storeInput(p.Basic().ID(), input)
		}
	}

	// freeze input, concurrent reads are fine
	ibuf := i.ibufs[i.game.Tick%inputBuffererCount]
	lastBuf := i.ibufs[(i.game.Tick+inputBuffererCount-1)%inputBuffererCount]

	// apply inputs to player
	for _, p := range i.players {
		inputs, _ := ibuf[p.Basic().ID()]
		last, _ := lastBuf[p.Basic().ID()]
		i.updateInput(p, inputs, last)
	}

	// clear out buffer
	i.ibufs[i.game.Tick%inputBuffererCount] = NewInputBufferer()
}

const walkSpeed = 0.1

// applies the inputs to a player
func (i *PlayerInputSystem) updateInput(p model.PlayerEntity, next, last *model.PlayerInput) {

	resolveHandCollisions(p)

	// reset
	p.Hand().Collider.Shape().Mask = 0

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
	i.applyAction(p, next.Action)
}

func resolveHandCollisions(player model.PlayerEntity) {
	hand := player.Hand()
	if hand.Item.ItemDefinition == nil {
		return
	}

	for v := range hand.Collider.Collisions() {
		usr := v.Shape().UserData
		if usr == nil {
			log.Printf("Missing UserData!")
			continue
		}

		r, ok := usr.(model.Interacter)
		if !ok {
			log.Printf("Non conformant UserData: %T", usr)
			continue
		}
		r.PlayerHitsWith(player, hand.Item)
	}
}

func (i *PlayerInputSystem) applyAction(p model.PlayerEntity, action *model.Action) {

	if action == nil {
		return
	}

	item, err := i.game.itemRegistry.Get(action.Item)
	if err != nil {
		log.Printf("😩 Unknown Action Item: %s", err)
		return
	}

	log.Printf("✊ Action going on: %s(%s)", BerryhunterApi.EnumNamesActionType[int(action.Type)], item.Name)
	var newAction model.PlayerAction = nil
	switch action.Type {
	case BerryhunterApi.ActionTypePrimary:
		newAction = actions.NewPrimary(item, p)
		break
	case BerryhunterApi.ActionTypeCraftItem:
		newAction = actions.NewCraft(item, p)
		break

	case BerryhunterApi.ActionTypeDropItem:
		newAction = actions.NewDrop(item, p)
		break

	case BerryhunterApi.ActionTypeConsumeItem:
		newAction = actions.NewConsume(item, p)
		break

	case BerryhunterApi.ActionTypeEquipItem:
		newAction = actions.NewEquip(item, p)
		break

	case BerryhunterApi.ActionTypeUnequipItem:
		newAction = actions.NewUnequip(item, p)
		break

	case BerryhunterApi.ActionTypePlaceItem:
		newAction = actions.NewPlace(item, p, i.game)
		break
	}
	if newAction != nil {
		p.AddAction(newAction)
	}
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
		if player.Basic().ID() == b.ID() {
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
