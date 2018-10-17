package placeable

import (
        "fmt"
        "github.com/trichner/berryhunter/api/schema/BerryhunterApi"
        "github.com/trichner/berryhunter/backend/items"
        "github.com/trichner/berryhunter/backend/model"
        "github.com/trichner/berryhunter/backend/model/vitals"
        "github.com/trichner/berryhunter/backend/phy"
        "log"
        "math"
)

var _ = model.PlaceableEntity(&Placeable{})

type Placeable struct {
        model.BaseEntity
        item       items.Item
        health     vitals.VitalSign
        definition *items.ItemDefinition

        radiator      *model.HeatRadiator
        ticksLeft     int
        statusEffects model.StatusEffects
}

func (p *Placeable) Update(dt float32) bool {
        p.ticksLeft -= 1
        // prevent underflow
        if p.ticksLeft < 0 {
                p.ticksLeft = 0
        }
        return p.health > 0
}

func (p *Placeable) Decayed() bool {
        return p.ticksLeft <= 0
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
        d := item.ItemDefinition

        if d == nil {
                return nil, fmt.Errorf("No resource provided.")
        }

        if d.Body == nil {
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
                radiator.Radius = item.Factors.HeatRadius
                heaterBody := phy.NewCircle(phy.VEC2F_ZERO, radiator.Radius)
                heaterBody.Shape().IsSensor = true
                heaterBody.Shape().Mask = int(model.LayerHeatCollision)
                heaterBody.Shape().Group = -1 // no need to collide with other heat sources
                radiator.Body = heaterBody
        }

        // setup the decay time
        var ticksLeft int = math.MaxInt32
        if item.Factors.DurationInTicks != 0 {
                ticksLeft = item.Factors.DurationInTicks
        }

        base := model.NewBaseEntity(body, BerryhunterApi.EntityTypePlaceable)
        p := &Placeable{
                BaseEntity:    base,
                item:          item,
                health:        vitals.Max,
                definition:    d,
                radiator:      radiator,
                ticksLeft:     ticksLeft,
                statusEffects: model.NewStatusEffects(),
        }
        p.Body.Shape().UserData = p
        return p, nil
}

func (p *Placeable) Health() vitals.VitalSign {
        return p.health
}

func (p *Placeable) PlayerHitsWith(player model.PlayerEntity, item items.Item) {
        log.Printf("🎯")

        vulnerability := p.definition.Factors.Vulnerability
        if vulnerability == 0 {
                vulnerability = 1
        }

        dmgFraction := item.Factors.Damage * vulnerability
        if dmgFraction > 0 {
                p.health = p.health.SubFraction(dmgFraction)
                p.StatusEffects().Add(BerryhunterApi.StatusEffectDamaged)
        }
}
