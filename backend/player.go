package main

import (
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"fmt"
)

var _ = model.PlayerEntity(&player{})

//---- player
type player struct {
	name string

	model.BaseEntity

	registry items.Registry
	game     *Game

	angle  float32
	client *net.Client

	viewport *phy.Box

	hand     *phy.Circle
	handItem items.Item

	inventory items.Inventory
	items.Equipment

	actionTick uint

	model.PlayerVitalSigns
}

func (p *player) PlayerHitsWith(player model.PlayerEntity, item items.Item) {
	h := p.PlayerVitalSigns.Health
	h -= 50
	if h < 0 {
		h = 0
	}
	p.PlayerVitalSigns.Health = h
}

func (p *player) Name() string {
	return fmt.Sprintf("player %d", p.ID())
}

func (p *player) Bodies() model.Bodies {
	b := make(model.Bodies, 3)
	b[0] = p.Body
	b[1] = p.hand
	b[2] = p.viewport
	return b
}

func (p *player) VitalSigns() *model.PlayerVitalSigns {
	return &p.PlayerVitalSigns
}

func (p *player) Inventory() *items.Inventory {
	return &p.inventory
}

func (p *player) Viewport() phy.DynamicCollider {
	return p.viewport
}

func (p *player) Client() *net.Client {
	return p.client
}

const viewPortWidth = 20.0
const viewPortHeight = 12.0

func (p *player) Position() phy.Vec2f {
	return p.Body.Position()
}
func (p *player) SetPosition(v phy.Vec2f) {
	p.Body.SetPosition(v)
	p.viewport.SetPosition(v)
	p.updateHand()
}

func (p *player) SetAngle(a float32) {
	p.angle = a
	p.updateHand()
}

func (p *player) Angle() float32 {
	return p.angle
}

func NewPlayer(g *Game, c *net.Client) *player {

	registry := g.items

	e := newCircleEntity(0.25)

	e.EntityType = DeathioApi.EntityTypeCharacter
	p := &player{BaseEntity: e,
		client:              c,
		Equipment:           items.NewEquipment(),
		registry:            registry,
		game:                g,
	}

	// setup body
	shapeGroup := int(p.ID())
	p.Body.Shape().UserData = p
	p.Body.Shape().Group = shapeGroup
	p.Body.Shape().Layer = model.LayerStaticCollision

	// setup viewport
	p.viewport = phy.NewBox(e.Body.Position(), phy.Vec2f{viewPortWidth / 2, viewPortHeight / 2})

	p.viewport.Shape().IsSensor = true
	p.viewport.Shape().Layer = model.LayerAllCollision
	p.viewport.Shape().Group = shapeGroup

	// setup inventory
	p.inventory = items.NewInventory()

	//--- initialize inventory
	var item items.Item
	var err error
	item, err = registry.GetByName("WoodClub")
	if err != nil {
		panic(err)
	}
	p.inventory.AddItem(items.NewItemStack(item, 1))

	item, err = registry.GetByName("BronzeSword")
	if err != nil {
		panic(err)
	}
	p.inventory.AddItem(items.NewItemStack(item, 1))

	//--- setup vital signs
	p.PlayerVitalSigns.Health = 255
	p.PlayerVitalSigns.Satiety = 255
	p.PlayerVitalSigns.BodyTemperature = 255

	// setup hand sensor
	p.hand = phy.NewCircle(e.Body.Position(), 0.25)
	p.hand.Shape().IsSensor = true
	p.hand.Shape().Group = shapeGroup
	p.hand.Shape().Layer = 0 //TODO

	p.updateHand()

	return p
}

func (p *player) startAction(tool items.Item) {
	p.handItem = tool
	p.hand.Shape().Layer = model.LayerRessourceCollision
}

var handOffset = phy.Vec2f{0.25, 0}

func (p *player) updateHand() {

	// could cache Rotation matrix/ handOffset
	relativeOffset := phy.NewRotMat2f(p.angle).Mult(handOffset)
	handPos := p.Position().Add(relativeOffset)
	p.hand.SetPosition(handPos)
}

func (p *player) Craft(i items.Item) bool {

	r := i.Recipe

	stacks := make([]*items.ItemStack, 0)
	for _, m := range r.Materials {
		stacks = append(stacks, items.NewItemStack(m.Item, m.Count))
	}

	if !p.inventory.CanConsumeItems(stacks) {
		return false
	}

	p.inventory.ConsumeItems(stacks)

	//TODO defer
	p.inventory.AddItem(items.NewItemStack(i, 1))
	return true
}

func (p *player) Update(dt float32) {
	// update time based tings

	// resolve collisions
}
