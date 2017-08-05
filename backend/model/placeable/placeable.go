package placeable

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"fmt"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
)

var _ = model.PlaceableEntity(&Placeable{})

type Placeable struct {
	model.BaseEntity
	item items.Item

	radiator *model.HeatRadiator
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

func NewPlaceable(item items.Item) (*Placeable, error) {

	if item.ItemDefinition == nil {
		return nil, fmt.Errorf("No resource provided.")
	}

	if item.ItemDefinition.Body == nil {
		return nil, fmt.Errorf("ItemDefinition is missing body property.")
	}

	body := phy.NewCircle(phy.VEC2F_ZERO, item.Body.Radius)
	body.Shape().IsSensor = true

	if body == nil {
		return nil, fmt.Errorf("No body provided.")
	}

	var radiator *model.HeatRadiator = nil

	if item.Factors.Warmth != 0 {
		radiator = &model.HeatRadiator{}
		radiator.Heat = item.Factors.Warmth
		radiator.Radius = item.Factors.Radius
		heaterBody := phy.NewCircle(phy.VEC2F_ZERO, radiator.Radius)
		heaterBody.Shape().IsSensor = true
		heaterBody.Shape().Layer = model.LayerHeatCollision
		heaterBody.Shape().Group = -1 // no need to collide with other heat sources
		radiator.Body = heaterBody
	}

	base := model.NewBaseEntity(body, DeathioApi.EntityTypePlaceable)
	p := &Placeable{
		BaseEntity: base,
		item:       item,
		radiator:   radiator,
	}
	p.Body.Shape().UserData = p
	return p, nil
}
