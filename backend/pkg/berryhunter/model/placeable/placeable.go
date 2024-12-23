package placeable

import (
	"fmt"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
	"log"
	"math"

	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/vitals"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
)

var _ = model.PlaceableEntity(&Placeable{})

type Placeable struct {
	model.BaseEntity
	item items.Item

	health        vitals.VitalSign
	radiator      *model.HeatRadiator
	ticksLeft     int
	statusEffects model.StatusEffects
}

func (p *Placeable) Update(dt float32) {
	p.ticksLeft -= 1

	// prevent underflow
	if p.ticksLeft < 0 {
		p.ticksLeft = 0
	}
}

func (p *Placeable) Decayed() bool {
	return p.ticksLeft <= 0 || p.health <= 0
}

func (p *Placeable) HeatRadiation() *model.HeatRadiator {
	return p.radiator
}

func (p *Placeable) SetPosition(pos phy.Vec2f) {
	p.BaseEntity.SetPosition(pos)
	if p.radiator != nil {
		p.radiator.Body.SetPosition(pos)
	}
}

func (p *Placeable) Bodies() model.Bodies {
	b := p.BaseEntity.Bodies()
	if p.radiator != nil {
		b = append(b, p.radiator.Body)
	}
	return b
}

func (p *Placeable) Item() items.Item {
	return p.item
}

func (p *Placeable) StatusEffects() *model.StatusEffects {
	return &p.statusEffects
}

func NewPlaceable(item items.Item) (*Placeable, error) {
	if item.ItemDefinition == nil {
		return nil, fmt.Errorf("No resource provided.")
	}

	if item.ItemDefinition.Body == nil {
		return nil, fmt.Errorf("ItemDefinition is missing body property.")
	}

	body := phy.NewCircle(phy.VEC2F_ZERO, item.Body.Radius)
	if item.Body.Solid {
		body.Shape().Layer =
			int(model.LayerPlayerStaticCollision |
				model.LayerMobStaticCollision |
				model.LayerActionCollision |
				model.LayerViewportCollision |
				model.LayerPlaceableCollision)
	} else {
		body.Shape().Layer =
			int(model.LayerViewportCollision |
				model.LayerPlaceableCollision)
		body.Shape().IsSensor = true
	}

	if body == nil {
		return nil, fmt.Errorf("No body provided.")
	}

	var radiator *model.HeatRadiator = nil

	if item.Factors.HeatPerTick != 0 {
		radiator = &model.HeatRadiator{}
		radiator.HeatPerTick = item.Factors.HeatPerTick
		radiator.Radius = item.Factors.HeatRadius
		heaterBody := phy.NewCircle(phy.VEC2F_ZERO, radiator.Radius)
		heaterBody.Shape().IsSensor = true
		heaterBody.Shape().Mask = int(model.LayerHeatCollision)
		heaterBody.Shape().Group = -1 // no need to collide with other heat sources
		radiator.Body = heaterBody
	}

	// set up the decay time
	var ticksLeft int = math.MaxInt32
	if item.Factors.DurationInTicks != 0 {
		ticksLeft = item.Factors.DurationInTicks
	}

	base := model.NewBaseEntity(body, model.EntityType(BerryhunterApi.EntityTypePlaceable))
	p := &Placeable{
		BaseEntity:    base,
		item:          item,
		health:        vitals.Max,
		radiator:      radiator,
		ticksLeft:     ticksLeft,
		statusEffects: model.NewStatusEffects(),
	}
	p.Body.Shape().UserData = p
	return p, nil
}

func (p *Placeable) takeDamage(damage float32, s model.StatusEffect) {
	vulnerability := p.item.Factors.Vulnerability
	if vulnerability == 0 {
		vulnerability = 1
	}

	dmgFraction := damage * vulnerability
	if dmgFraction > 0 {
		p.health = p.health.SubFraction(dmgFraction)
		p.StatusEffects().Add(s)
	}
}

func (p *Placeable) PlayerHitsWith(player model.PlayerEntity, item items.Item) {
	log.Printf("💥")

	p.takeDamage(item.Factors.StructureDamage, model.StatusEffectDamaged)
}

func (p *Placeable) MobTouches(e model.MobEntity, factors mobs.Factors) {
	log.Printf("👉")

	p.takeDamage(factors.StructureDamageFraction, model.StatusEffectDamagedAmbient)
}
