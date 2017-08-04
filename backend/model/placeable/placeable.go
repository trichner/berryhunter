package placeable

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"fmt"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
)

type Placeable struct {
	model.BaseEntity
	item items.Item
}

func (p *Placeable) Item() items.Item {
	return p.item
}

func NewPlaceable(body *phy.Circle, resource items.Item) (*Placeable, error) {

	if resource.ItemDefinition == nil {
		return nil, fmt.Errorf("No resource provided.")
	}

	if body == nil {
		return nil, fmt.Errorf("No body provided.")
	}

	base := model.NewBaseEntity(body, DeathioApi.EntityTypePlaceable)
	r := &Placeable{
		BaseEntity: base,
		item:       resource,
	}
	r.Body.Shape().UserData = r
	return r, nil
}
