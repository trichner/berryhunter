package player

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/minions"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"log"
	"github.com/trichner/berryhunter/backend/model/constant"
	"github.com/trichner/berryhunter/backend/model/vitals"
	"github.com/trichner/berryhunter/backend/cfg"
)

var _ = model.PlayerEntity(&player{})

func New(g model.Game, c model.Client, name string) model.PlayerEntity {

	e := minions.NewCircleEntity(0.25)

	e.EntityType = BerryhunterApi.EntityTypeCharacter
	p := &player{BaseEntity: e,
		client:         c,
		equipment:      items.NewEquipment(),
		name:           name,
		ownedEntitites: model.NewBasicEntities(),
		config: &g.Config().PlayerConfig,
		stats: model.Stats{BirthTick: g.Ticks()},
	}

	// setup body
	shapeGroup := int(p.ID())
	p.Body.Shape().UserData = p
	p.Body.Shape().Group = shapeGroup
	p.Body.Shape().Layer = model.LayerViewportCollision | model.LayerHeatCollision
	p.Body.Shape().Mask = model.LayerPlayerStaticCollision | model.LayerBorderCollision

	// setup viewport
	p.viewport = phy.NewBox(e.Body.Position(), phy.Vec2f{constant.ViewPortWidth / 2, constant.ViewPortHeight / 2})

	p.viewport.Shape().IsSensor = true
	p.viewport.Shape().Mask = model.LayerViewportCollision
	p.viewport.Shape().Group = shapeGroup

	//--- initialize inventory
	inventory, err := initializePlayerInventory(g.Items())
	if err != nil {
		panic(err)
	}
	p.inventory = inventory

	//--- setup vital signs
	p.PlayerVitalSigns.Health = vitals.Max
	p.PlayerVitalSigns.Satiety = vitals.Max
	p.PlayerVitalSigns.BodyTemperature = vitals.Max

	// setup hand sensor
	hand := phy.NewCircle(e.Body.Position(), 0.25)
	hand.Shape().IsSensor = true
	hand.Shape().Group = shapeGroup
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

	model.PlayerVitalSigns

	config *cfg.PlayerConfig

	ownedEntitites model.BasicEntities

	ongoingAction model.PlayerAction

	isGod bool

	stats model.Stats
}

func (p *player) AddAction(a model.PlayerAction) {
	if p.ongoingAction != nil && p.ongoingAction.TicksRemaining() > 0 {

		log.Printf("😧 Already action going on.")
		return
	}

	a.Start()
	p.ongoingAction = a
}

func (p *player) CurrentAction() model.PlayerAction {
	return p.ongoingAction
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

func (p *player) Config() *cfg.PlayerConfig {
	return p.config
}

func (p *player) Stats() *model.Stats {
	return &p.stats
}

func initializePlayerInventory(r items.Registry) (items.Inventory, error) {

	type startItem struct {
		name  string
		count int
	}
	inventory := items.NewInventory()

	// This is the inventory a new player starts with
	startItems := []startItem{
//		{"IronTool", 1},
//		{"BronzeSword", 1},
//		{"Workbench", 1},
//		{"BigCampfire", 3},
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
	p.hand.Collider.Shape().Mask = model.LayerRessourceCollision | model.LayerActionCollision
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

func (p *player) SetGodmode(on bool) {
	p.isGod = on
}
