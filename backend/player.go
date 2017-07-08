package main

import (
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

//---- player
type player struct {
	*entity
	angle  float32
	Health uint
	Hunger uint
	client *net.Client

	viewport *phy.Box

	hand     *phy.Circle
	handItem items.ItemEnum

	inventory items.Inventory

	actionTick uint
}

const viewPortWidth = 20.0
const viewPortHeight = 12.0

func (p *player) Position() phy.Vec2f {
	return p.body.Position()
}
func (p *player) SetPosition(v phy.Vec2f) {
	p.body.SetPosition(v)
	p.viewport.SetPosition(v)
	p.updateHand()
}

func (p *player) SetAngle(a float32) {
	p.angle = a
	p.updateHand()
}

func NewPlayer(c *net.Client) *player {
	e := newCircleEntity(0.25)

	e.entityType = DeathioApi.EntityTypeCharacter
	p := &player{entity: e, client: c}

	// setup body
	shapeGroup := int(p.ID())
	p.body.Shape().UserData = p
	p.body.Shape().Group = shapeGroup
	p.body.Shape().Layer = model.LayerStaticCollision

	// setup viewport
	p.viewport = phy.NewBox(e.body.Position(), phy.Vec2f{viewPortWidth / 2, viewPortHeight / 2})

	p.viewport.Shape().IsSensor = true
	p.viewport.Shape().Layer = model.LayerAllCollision
	p.viewport.Shape().Group = shapeGroup

	// setup inventory
	p.inventory = items.NewInventory()
	p.inventory.AddItem(items.NewItemStack(DeathioApi.ItemWoodClub, 1))
	p.inventory.AddItem(items.NewItemStack(DeathioApi.ItemIronTool, 3))

	// setup hand sensor
	p.hand = phy.NewCircle(e.body.Position(), 0.25)
	p.hand.Shape().IsSensor = true
	p.hand.Shape().Group = shapeGroup
	p.hand.Shape().Layer = 0 //TODO

	p.updateHand()

	return p
}

func (p *player) startAction(tool items.ItemEnum) {
	p.handItem = tool
	p.hand.Shape().Layer = model.LayerRessourceCollision
}

var handOffset = phy.Vec2f{0.25, 0}

func (p *player) updateHand() {

	// could cache rotation matrix/ handOffset
	relativeOffset := phy.NewRotMat2f(p.angle).Mult(handOffset)
	handPos := p.Position().Add(relativeOffset)
	p.hand.SetPosition(handPos)
}
