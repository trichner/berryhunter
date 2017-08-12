package main

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"log"
)

var _ = model.PlayerEntity(&player{})

//---- player
type player struct {
	name string

	model.BaseEntity

	registry items.Registry
	game     *Game

	angle  float32
	client model.Client

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
	dmg := uint32(item.Factors.Damage)
	if dmg < 1 {
		dmg = 1
	}

	dmg = dmg * 10000
	p.PlayerVitalSigns.Health = h.Sub(dmg)
}

func (p *player) Name() string {
	return p.name
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

func (p *player) Client() model.Client {
	return p.client
}

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

func NewPlayer(g *Game, c model.Client, name string) *player {

	registry := g.items

	e := newCircleEntity(0.25)

	e.EntityType = BerryhunterApi.EntityTypeCharacter
	p := &player{BaseEntity: e,
		client:              c,
		Equipment:           items.NewEquipment(),
		registry:            registry,
		game:                g,
		name:                name,
	}

	// setup body
	shapeGroup := int(p.ID())
	p.Body.Shape().UserData = p
	p.Body.Shape().Group = shapeGroup
	p.Body.Shape().Layer = model.LayerStaticCollision | model.LayerHeatCollision

	// setup viewport
	p.viewport = phy.NewBox(e.Body.Position(), phy.Vec2f{model.ViewPortWidth / 2, model.ViewPortHeight / 2})

	p.viewport.Shape().IsSensor = true
	p.viewport.Shape().Layer = model.LayerAllCollision
	p.viewport.Shape().Group = shapeGroup

	//--- initialize inventory
	inventory, err := initializePlayerInventory(registry)
	if err != nil {
		panic(err)
	}
	p.inventory = inventory

	//--- setup vital signs
	p.PlayerVitalSigns.Health =	model.VitalSignMax
	p.PlayerVitalSigns.Satiety = model.VitalSignMax
	p.PlayerVitalSigns.BodyTemperature = model.VitalSignMax

	// setup hand sensor
	p.hand = phy.NewCircle(e.Body.Position(), 0.25)
	p.hand.Shape().IsSensor = true
	p.hand.Shape().Group = shapeGroup
	p.hand.Shape().Layer = 0 //TODO

	p.updateHand()

	return p
}

func initializePlayerInventory(r items.Registry) (items.Inventory, error) {

	type startItem struct {
		name  string
		count int
	}
	inventory := items.NewInventory()

	// This is the inventory a new player starts with
	startItems := []startItem{
		{"IronTool", 1},
		{"BronzeSword", 1},
		{"Workbench", 1},
		{"Campfire", 1},
	}

	//--- initialize inventory
	var item items.Item
	var err error
	for _, i := range startItems {
		item, err = r.GetByName(i.name)
		if err != nil {
			return inventory, err
		}
		inventory.AddItem(items.NewItemStack(item, i.count))
	}

	return inventory, nil
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
	inventory := p.Inventory()

	stacks := r.Materials
	if !inventory.CanConsumeItems(stacks) {
		return false
	}

	// check if there is space in the inventory
	newItem := items.NewItemStack(i, 1)
	if !inventory.CanConsume(newItem) && inventory.Cap() == inventory.Count() {
		return false
	}

	// ok, we're good to go, remove materials & craft
	inventory.ConsumeItems(stacks)

	//TODO defer
	inventory.AddItem(newItem)
	return true
}

func (p *player) Update(dt float32) {
	// update time based tings

	// heat
	t := p.VitalSigns().BodyTemperature
	temperatureStep := uint32(100000)
	p.VitalSigns().BodyTemperature = t.Sub(temperatureStep)

	// satiety
	s := p.VitalSigns().Satiety
	satietyStep := uint32(150000)
	p.VitalSigns().Satiety = s.Sub(satietyStep)

	//TODO Hack
	join := p.Client().NextJoin()
	if join != nil {
		p.name = join.PlayerName
		log.Printf("Join message: %s", join.PlayerName)
	}
}
