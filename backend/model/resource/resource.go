package resource

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"fmt"
)

type Resource struct {
	model.BaseEntity
	resource items.Item
}

func (r *Resource) Resource() items.Item {
	return r.resource
}

func NewResource(body *phy.Circle, resource items.Item, entityType model.EntityType) (*Resource, error) {

	if resource.ItemDefinition == nil {
		return nil, fmt.Errorf("No resource provided.")
	}

	if body == nil {
		return nil, fmt.Errorf("No body provided.")
	}

	base := model.NewBaseEntity(body, entityType)
	r := &Resource{
		BaseEntity: base,
		resource:   resource,
	}
	r.Body.Shape().UserData = r
	return r, nil
}

func (r *Resource) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	yield := item.Factors.Yield
	if yield < 1 {
		yield = 1
	}
	p.Inventory().AddItem(items.NewItemStack(r.resource, yield))
}
