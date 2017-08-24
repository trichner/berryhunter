package player

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/minions"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
)

var _ = model.PlayerEntity(&player{})

func New(r items.Registry, c model.Client, name string) model.PlayerEntity {

	e := minions.NewCircleEntity(0.25)

	e.EntityType = BerryhunterApi.EntityTypeCharacter
	p := &player{BaseEntity: e,
		client:         c,
		equipment:      items.NewEquipment(),
		name:           name,
		ownedEntitites: model.NewBasicEntities(),
	}

	// setup body
	shapeGroup := int(p.ID())
	p.Body.Shape().UserData = p
	p.Body.Shape().Group = shapeGroup
	p.Body.Shape().Layer = model.LayerStaticCollision | model.LayerHeatCollision | model.LayerViewportCollision | model.LayerBorderCollision

	// setup viewport
	p.viewport = phy.NewBox(e.Body.Position(), phy.Vec2f{model.ViewPortWidth / 2, model.ViewPortHeight / 2})

	p.viewport.Shape().IsSensor = true
	p.viewport.Shape().Layer = model.LayerViewportCollision
	p.viewport.Shape().Group = shapeGroup

	//--- initialize inventory
	inventory, err := initializePlayerInventory(r)
	if err != nil {
		panic(err)
	}
	p.inventory = inventory

	//--- setup vital signs
	p.PlayerVitalSigns.Health = model.VitalSignMax
	p.PlayerVitalSigns.Satiety = model.VitalSignMax
	p.PlayerVitalSigns.BodyTemperature = model.VitalSignMax

	// setup hand sensor
	hand := phy.NewCircle(e.Body.Position(), 0.25)
	hand.Shape().IsSensor = true
	hand.Shape().Group = shapeGroup
	hand.Shape().Layer = 0 //TODO
	p.hand = model.Hand{Collider: hand}

	p.updateHand()

	return p
}

//---- player
type player struct {
	name string

	model.BaseEntity

	angle  float32
	client model.Client

	viewport *phy.Box

	hand      model.Hand
	inventory items.Inventory
	equipment *items.Equipment

	actionTick uint

	model.PlayerVitalSigns

	ownedEntitites model.BasicEntities
}

func (p *player) PlayerHitsWith(player model.PlayerEntity, item items.Item) {
	h := p.PlayerVitalSigns.Health

	dmgFraction := item.Factors.Damage // * vulnerability
	p.PlayerVitalSigns.Health = h.SubFraction(dmgFraction)
}

func (p *player) Name() string {
	return p.name
}

func (p *player) Equipment() *items.Equipment {
	return p.equipment
}

func (p *player) Bodies() model.Bodies {
	b := make(model.Bodies, 3)
	b[0] = p.Body
	b[1] = p.hand.Collider
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

func (p *player) Hand() *model.Hand {
	return &p.hand
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
	p.hand.Item = tool
	p.hand.Collider.Shape().Layer = model.LayerRessourceCollision
}

var handOffset = phy.Vec2f{0.25, 0}

func (p *player) updateHand() {

	// could cache Rotation matrix/ handOffset
	relativeOffset := phy.NewRotMat2f(p.angle).Mult(handOffset)
	handPos := p.Position().Add(relativeOffset)
	p.hand.Collider.SetPosition(handPos)
}

func (p *player) OwnedEntities() model.BasicEntities {
	return p.ownedEntitites
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
