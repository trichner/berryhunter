package placeable

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"fmt"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
)

type Placeable struct {
	model.BaseEntity
	item items.Item
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

	base := model.NewBaseEntity(body, BerryhunterApi.EntityTypePlaceable)
	p := &Placeable{
		BaseEntity: base,
		item:       item,
	}
	p.Body.Shape().UserData = p
	return p, nil
}
