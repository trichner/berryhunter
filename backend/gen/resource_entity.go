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
	return NewStaticEntityWithBody(items, p, &selected, rnd)
}

func NewStaticEntityWithBody(items items.Registry, p phy.Vec2f, body *staticEntityBody, rnd *rand.Rand) model.ResourceEntity {

	ball := phy.NewCircle(p, body.radius)
	ball.Shape().Layer = body.collisionLayer

	resourceItem, err := items.GetByName(body.resourceName)
	if err != nil {
		log.Fatalf("Unknown ressource: %s / %s\n", body.resourceName, err)
	}

	seed := ( int64(p.X)<<32 ^ int64(p.Y)) ^ rnd.Int63()
	rand.NewSource(rnd.Int63() ^ rnd.Int63())
	random := rand.New(rand.NewSource(seed))

	r, err := resource.NewResource(ball, random, resourceItem, body.entityType)
	if err != nil {
		panic(err)
	}
	return r
}
