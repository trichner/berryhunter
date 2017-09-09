package resource

import (
	"fmt"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"math/rand"
	"log"
)

var _ = model.ResourceEntity(&Resource{})

type Resource struct {
	model.BaseEntity
	stock model.ResourceStock

	rand *rand.Rand
}

func (r *Resource) replenish(i int) {
	res := &r.stock
	res.Available += i
	if res.Available > res.Capacity {
		res.Available = res.Capacity
	}
}

func (r *Resource) Resource() *model.ResourceStock {
	return &r.stock
}

func (r *Resource) yield(i int) (yielded int) {
	res := &r.stock
	if res.Available < i {
		yielded = res.Available
		res.Available = 0
	} else {
		res.Available -= i
		yielded = i
	}
	return
}

func (r *Resource) Update(dt float32) {
	res := &r.stock
	if res.Item.Factors.ReplenishProbability <= 0 {
		return
	}
	if r.rand.Intn(res.Item.Factors.ReplenishProbability) == 0 {
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
		stock: model.ResourceStock{
			Item:      resource,
			Capacity:  resource.Factors.Capacity,
			Available: resource.Factors.Capacity / 2,
		},
		rand:       rand,
	}
	r.Body.Shape().UserData = r
	return r, nil
}

func (r *Resource) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	yield := item.Factors.Yield
	if yield <= 0 {
		log.Printf("😕 %s has no yield for %s.", item.Name, r.stock.Item.Name)
		return
	}
	y := r.yield(yield)
	p.Inventory().AddItem(items.NewItemStack(r.stock.Item, y))
}
