package resource

import (
	"fmt"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"math/rand"
)

var _ = model.ResourceEntity(&Resource{})

type Resource struct {
	model.BaseEntity
	resource items.Item

	capacity  int
	available int

	rand *rand.Rand
}

func (r *Resource) replenish(i int) {
	r.available += i
	if r.available > r.capacity {
		r.available = r.capacity
	}
}

func (r *Resource) Resource() items.ItemStack {
	return *items.NewItemStack(r.resource, int(r.capacity))
}

func (r *Resource) yield(i int) (yielded int) {
	if r.available < i {
		yielded = r.available
		r.available = 0
	} else {
		r.available -= i
		yielded = i
	}
	return
}

func (r *Resource) Update(dt float32) {
	if r.resource.Factors.ReplenishProbability <= 0 {
		return
	}
	if r.rand.Intn(r.resource.Factors.ReplenishProbability) == 0 {
		r.replenish(1)
	}
}

func NewResource(body *phy.Circle, rand *rand.Rand, resource items.Item, entityType model.EntityType) (*Resource, error) {

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
		capacity:   resource.Factors.Capacity,
		available:  resource.Factors.Capacity / 2,
		rand:       rand,
	}
	r.Body.Shape().UserData = r
	return r, nil
}

func (r *Resource) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	yield := item.Factors.Yield
	y := r.yield(yield)
	p.Inventory().AddItem(items.NewItemStack(r.resource, y))
}
