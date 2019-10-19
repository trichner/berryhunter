package resource

import (
	"fmt"
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"log"
	"math/rand"
)

var _ = model.ResourceEntity(&Resource{})

type EffectsByEvent struct {
	// Applied to the yielding player entity
	OnYield []*effects.Effect
	// Applied to the resource entity
	OnYielded []*effects.Effect
}

type Resource struct {
	model.BaseEntity
	stock model.ResourceStock

	rand                    *rand.Rand
	invReplenishProbability int
	statusEffects           model.StatusEffects
	effectStack             effects.EffectStack
	effects                 *EffectsByEvent
}

func (r *Resource) replenish(i int) {
	res := &r.stock
	res.Available += i
	if res.Available > res.Capacity {
		res.Available = res.Capacity
	}
}

func (r *Resource) StatusEffects() *model.StatusEffects {
	return &r.statusEffects
}

func (r *Resource) EffectStack() *effects.EffectStack {
	return &r.effectStack
}

func (r *Resource) Resource() *model.ResourceStock {
	return &r.stock
}

func (r *Resource) yield(i int) (yielded int) {

	i -= r.stock.Item.ItemDefinition.Factors.MinYield
	if i < 1 {
		return 0
	}

	r.StatusEffects().Add(model.StatusEffectYielded)

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
	if r.rand.Intn(r.invReplenishProbability) == 0 {
		r.replenish(1)
	}
}

func NewResource(body *phy.Circle, rand *rand.Rand, resource items.Item, entityType model.EntityType) (*Resource, error) {

	if resource.ItemDefinition == nil {
		return nil, fmt.Errorf("no resource provided")
	}

	replenishProbability := resource.ItemDefinition.Factors.ReplenishProbability
	if replenishProbability <= 0 || replenishProbability > 1 {
		return nil, fmt.Errorf("invalid replenishProbability '%d' for %s not in (0,1]", replenishProbability, resource.Name)
	}

	invReplenishProbability := int(1.0 / replenishProbability)

	if body == nil {
		return nil, fmt.Errorf("no body provided")
	}

	base := model.NewBaseEntity(body, entityType)
	r := &Resource{
		BaseEntity: base,
		stock: model.ResourceStock{
			Item:      resource,
			Capacity:  resource.Factors.Capacity,
			Available: resource.Factors.Capacity / 2,
		},
		rand:                    rand,
		invReplenishProbability: invReplenishProbability,
		statusEffects:           model.NewStatusEffects(),
		effectStack:             *effects.NewEffectStack(),
		effects: &EffectsByEvent{
			OnYield:   resource.Effects.OnYield,
			OnYielded: resource.Effects.OnYielded,
		},
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

	// resistance might be too high
	y := r.yield(yield)
	if y <= 0 {
		return
	}

	r.EffectStack().Add(item.Effects.OnHitResource)
	r.EffectStack().Add(r.effects.OnYielded)
	p.EffectStack().Add(r.effects.OnYield)

	p.Inventory().AddItem(items.NewItemStack(r.stock.Item, y))
}
