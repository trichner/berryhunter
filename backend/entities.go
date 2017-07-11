package main

import (
	"engo.io/ecs"
	"math/rand"
	"github.com/trichner/berryhunter/backend/wrand"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"log"
	"github.com/trichner/berryhunter/backend/items"
)


//---- entity
type entity struct {
	ecs.BasicEntity
	body       *phy.Circle
	entityType model.EntityType
}

func (e *entity) Type() model.EntityType {
	return e.entityType
}

func (e *entity) SetPosition(x, y float32) {
	e.body.SetPosition(phy.Vec2f{x, y})
}

func (e *entity) X() float32 {
	return e.body.Position().X
}

func (e *entity) Y() float32 {
	return e.body.Position().Y
}

func (e *entity) AABB() model.AABB {
	return model.AABB(e.body.BoundingBox())
}

func (e *entity) Angle() float32 {
	return 0
}

func (e *entity) Radius() float32 {
	return e.body.Radius
}

type resourceEntity struct {
	entity
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
	r.entity = *newStaticCircleEntity(p, body.radius)

	r.entityType = body.entityType

	ressource, err := items.Get(body.ressource)
	if err != nil {
		log.Printf("Unknown ressource: %d\n", body.ressource)
		panic(err)
	}

	r.resource.resource = ressource
	r.body.Shape().UserData = r
	r.body.Shape().Layer = body.collisionLayer
	return r
}
