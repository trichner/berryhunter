package placeable

import (
	"fmt"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/berryhunterd/model/vitals"
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"log"
	"math"
)

var _ = model.PlaceableEntity(&Placeable{})

type EffectsByEvent struct {
	// Applied to the attacking player entity
	OnBeingHit []*effects.Effect
}

type Placeable struct {
	model.BaseEntity
	item items.Item

	health        vitals.VitalSign
	radiator      *model.HeatRadiator
	ticksLeft     int
	statusEffects model.StatusEffects
	effectStack   effects.EffectStack
	effects       *EffectsByEvent
}

func (p *Placeable) Update(dt float32) {
	p.ticksLeft -= 1

	// prevent underflow
	if (p.ticksLeft - p.effectStack.Factors().DurationInTicks) < 0 {
		p.ticksLeft = p.effectStack.Factors().DurationInTicks
	}
}

func (p *Placeable) Decayed() bool {
	return (p.ticksLeft - p.effectStack.Factors().DurationInTicks) <= 0 || p.health <= 0
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

func (p *Placeable) EffectStack() *effects.EffectStack {
	return &p.effectStack
}

func NewPlaceable(item items.Item, bonus struct{DurationInTicks int; HeatRadius float32; HeatPerTick uint32}) (*Placeable, error) {

	if item.ItemDefinition == nil {
		return nil, fmt.Errorf("No resource provided.")
	}

	if item.ItemDefinition.Body == nil {
		return nil, fmt.Errorf("ItemDefinition is missing body property.")
	}

	body := phy.NewCircle(phy.VEC2F_ZERO, item.Body.Radius)
	if item.Body.Solid {
		body.Shape().Layer = int(model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerActionCollision | model.LayerViewportCollision)
	} else {
		body.Shape().Layer = int(model.LayerViewportCollision)
		body.Shape().IsSensor = true
	}

	if body == nil {
		return nil, fmt.Errorf("No body provided.")
	}

	var radiator *model.HeatRadiator = nil

	if item.Factors.HeatPerTick != 0 {
		radiator = &model.HeatRadiator{}
		radiator.HeatPerTick = item.Factors.HeatPerTick
		radiator.HeatPerTick += bonus.HeatPerTick
		radiator.Radius = item.Factors.HeatRadius
		radiator.Radius += bonus.HeatRadius
		heaterBody := phy.NewCircle(phy.VEC2F_ZERO, radiator.Radius)
		heaterBody.Shape().IsSensor = true
		heaterBody.Shape().Mask = int(model.LayerHeatCollision)
		heaterBody.Shape().Group = -1 // no need to collide with other heat sources
		radiator.Body = heaterBody
		radiator.OnRadiatorCollision = item.Effects.OnRadiatorCollision
	}

	// setup the decay time
	var ticksLeft int = math.MaxInt32
	if item.Factors.DurationInTicks != 0 {
		ticksLeft = item.Factors.DurationInTicks
		ticksLeft += bonus.DurationInTicks
	}

	base := model.NewBaseEntity(body, BerryhunterApi.EntityTypePlaceable)
	p := &Placeable{
		BaseEntity:    base,
		item:          item,
		health:        vitals.Max,
		radiator:      radiator,
		ticksLeft:     ticksLeft,
		statusEffects: model.NewStatusEffects(),
		effectStack:   effects.NewEffectStack(),
		effects: &EffectsByEvent{
			OnBeingHit: item.Effects.OnBeingHit,
		},
	}
	p.Body.Shape().UserData = p
	return p, nil
}

func (p *Placeable) PlayerHitsWith(player model.PlayerEntity, item items.Item) {
	log.Printf("💥")
	vulnerability := p.item.Factors.Vulnerability
	if vulnerability == 0 {
		vulnerability = 1
	}

	p.EffectStack().Add(item.Effects.OnHitPlaceable)
	player.EffectStack().Add(p.effects.OnBeingHit)

	dmgFraction := item.Factors.StructureDamage
	dmgFraction *= player.EffectStack().Factors().StructureDamage
	dmgFraction *= vulnerability
	dmgFraction *= p.effectStack.Factors().Vulnerability
	if dmgFraction > 0 {
		p.health = p.health.SubFraction(dmgFraction)
		p.StatusEffects().Add(model.StatusEffectDamaged)
	}
}
