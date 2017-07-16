package main

import (
	"math/rand"
	"github.com/trichner/berryhunter/backend/wrand"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"log"
	"github.com/trichner/berryhunter/backend/items"
)

var _ = Interacter(&resourceEntity{})

type resourceEntity struct {
	model.BaseEntity
	resource
}

func NewRandomEntityFrom(items items.Registry, p phy.Vec2f, bodies []staticEntityBody, rnd *rand.Rand) *resourceEntity {
	choices := []wrand.Choice{}
	for _, b := range bodies {
		choices = append(choices, wrand.Choice{Weight: b.weight, Choice: b})
	}

	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(staticEntityBody)
	return NewStaticEntityWithBody(items, p, &selected)
}

func NewStaticEntityWithBody(items items.Registry, p phy.Vec2f, body *staticEntityBody) *resourceEntity {
	r := &resourceEntity{}
	r.BaseEntity = *newStaticCircleEntity(p, body.radius)

	r.EntityType = body.entityType

	ressource, err := items.Get(body.ressource)
	if err != nil {
		log.Printf("Unknown ressource: %d\n", body.ressource)
		panic(err)
	}

	r.resource.resource = ressource
	r.Body.Shape().UserData = r
	r.Body.Shape().Layer = body.collisionLayer
	return r
}
