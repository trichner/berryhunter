package gen

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/model/resource"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/wrand"
	"log"
	"math/rand"
)

var _ = model.Interacter(&resource.Resource{})

func NewRandomEntityFrom(items items.Registry, p phy.Vec2f, bodies []staticEntityBody, rnd *rand.Rand) model.ResourceEntity {
	choices := []wrand.Choice{}
	for _, b := range bodies {
		choices = append(choices, wrand.Choice{Weight: b.weight, Choice: b})
	}

	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(staticEntityBody)
	return NewStaticEntityWithBody(items, p, &selected)
}

func NewStaticEntityWithBody(items items.Registry, p phy.Vec2f, body *staticEntityBody) model.ResourceEntity {

	ball := phy.NewCircle(p, body.radius)
	ball.Shape().Layer = body.collisionLayer

	resourceItem, err := items.GetByName(body.resourceName)
	if err != nil {
		log.Fatalf("Unknown ressource: %s / %s\n", body.resourceName, err)
	}

	r, err := resource.NewResource(ball, resourceItem, body.entityType)
	if err != nil {
		panic(err)
	}
	return r
}
