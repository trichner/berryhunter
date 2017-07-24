package main

import (
	"math/rand"
	"github.com/trichner/berryhunter/backend/wrand"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"log"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model/resource"
)

var _ = Interacter(&resource.Resource{})

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

	resourceItem, err := items.GetByName(body.ressourceName)
	if err != nil {
		log.Fatalf("Unknown ressource: %s / %s\n", body.ressourceName, err)
	}

	return resource.NewResource(ball, resourceItem, body.entityType)
}
