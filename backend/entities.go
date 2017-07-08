package main

import (
	"engo.io/ecs"
	"math/rand"
	"github.com/trichner/berryhunter/backend/wrand"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"log"
)


//
type debugCircleShapeEntity struct {
	ecs.BasicEntity
	circle     *phy.Circle
	entityType model.EntityType
}

func (e *debugCircleShapeEntity) Type() model.EntityType {
	return e.entityType
}

func (e *debugCircleShapeEntity) X() float32 {
	return e.circle.Position().X
}

func (e *debugCircleShapeEntity) Y() float32 {
	return e.circle.Position().Y
}

func (e *debugCircleShapeEntity) AABB() model.AABB {
	return model.AABB(e.circle.BoundingBox())
}

func (e *debugCircleShapeEntity) Angle() float32 {
	return 0
}

func (e *debugCircleShapeEntity) Radius() float32 {
	return float32(e.circle.Radius)
}

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

func NewRandomEntityFrom(g *Game, p phy.Vec2f, bodies []staticEntityBody, rnd *rand.Rand) *resourceEntity {
	choices := []wrand.Choice{}
	for _, b := range bodies {
		choices = append(choices, wrand.Choice{Weight: b.weight, Choice: b})
	}

	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(staticEntityBody)
	return NewStaticEntityWithBody(g, p, &selected)
}

func NewStaticEntityWithBody(g *Game, p phy.Vec2f, body *staticEntityBody) *resourceEntity {
	r := &resourceEntity{}
	newStaticCircleEntity(&r.entity, p, body.radius)
	r.entityType = body.entityType

	ressource, ok := g.items.Get(body.ressource)
	if !ok {
		log.Fatalf("Unknown ressource: %d", body.ressource)
	}

	r.resource.resource = ressource
	r.body.Shape().UserData = r
	r.body.Shape().Layer = body.collisionLayer
	return r
}
