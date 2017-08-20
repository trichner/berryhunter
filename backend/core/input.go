package core

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/model/placeable"
	"github.com/trichner/berryhunter/backend/phy"
	"log"
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
	p.Hand().Collider.Shape().Layer = 0

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

	switch action.Type {
	case BerryhunterApi.ActionTypePrimary:
		if !hasItem(p, item) {
			return
		}
		p.Hand().Collider.Shape().Layer = -1
		p.Hand().Item = item
		break
	case BerryhunterApi.ActionTypeCraftItem:
		p.Craft(item)
		break

	case BerryhunterApi.ActionTypeDropItem:
		if !hasItem(p, item) {
			return
		}
		p.Inventory().DropAll(item)
		break

	case BerryhunterApi.ActionTypeConsumeItem:
		if !hasItem(p, item) {
			return
		}
		ok := p.Inventory().ConsumeItem(items.NewItemStack(item, 1))
		if ok {
			// prevent overflow
			h := p.VitalSigns().Satiety
			foodFraction := item.Factors.Food
			p.VitalSigns().Satiety = h.AddFraction(foodFraction)
		}
		break

	case BerryhunterApi.ActionTypeEquipItem:
		if !hasItem(p, item) {
			return
		}
		p.Equipment().Equip(item)
		break

	case BerryhunterApi.ActionTypeUnequipItem:
		if !hasItem(p, item) {
			return
		}
		p.Equipment().Unequip(item)
		break

	case BerryhunterApi.ActionTypePlaceItem:
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

		e, err := placeable.NewPlaceable(item)

		if err != nil {
			panic(err)
		}
		e.SetPosition(p.Position())
		i.game.AddEntity(e)
		p.OwnedEntities().Add(e)

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
