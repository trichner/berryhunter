package resource

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
)

type Resource struct {
	model.BaseEntity
	resource items.Item
}

func (r *Resource) Resource() items.Item {
	return r.resource
}

func NewResource(body *phy.Circle, resource items.Item, entityType model.EntityType) *Resource {

	base := model.NewBaseEntity(body, entityType)
	r := &Resource{
		BaseEntity: base,
		resource:   resource,
	}
	r.Body.Shape().UserData = r
	return r
}

func (r *Resource) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	p.Inventory().AddItem(items.NewItemStack(r.resource, 1))
}
