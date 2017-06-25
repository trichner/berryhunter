package main

import (
	"engo.io/ecs"
	"math/rand"
	"github.com/trichner/berryhunter/backend/wrand"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
)

type EntityType uint16

//---- basic interface with getters
type Entity interface {
	ID() uint64
	X() float32
	Y() float32
	Angle() float32
	Radius() float32
	Type() EntityType
	AABB() AABB
}

//
type debugCircleShapeEntity struct {
	ecs.BasicEntity
	circle     *phy.Circle
	entityType EntityType
}

func (e *debugCircleShapeEntity) Type() EntityType {
	return e.entityType
}

func (e *debugCircleShapeEntity) X() float32 {
	return e.circle.Position().X
}

func (e *debugCircleShapeEntity) Y() float32 {
	return e.circle.Position().Y
}

func (e *debugCircleShapeEntity) AABB() AABB {
	return AABB(e.circle.BoundingBox())
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
	entityType EntityType
}

func (e *entity) Type() EntityType {
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

func (e *entity) AABB() AABB {
	return AABB(e.body.BoundingBox())
}

func (e *entity) Angle() float32 {
	return 0
}

func (e *entity) Radius() float32 {
	return e.body.Radius
}

func NewRandomEntityFrom(p phy.Vec2f, bodies []staticEntityBody, rnd *rand.Rand) *entity {
	choices := []wrand.Choice{}
	for _, b := range bodies {
		choices = append(choices, wrand.Choice{Weight: b.weight, Choice: b})
	}

	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(staticEntityBody)
	return NewStaticEntityWithBody(p, &selected)
}

func NewStaticEntityWithBody(p phy.Vec2f, body *staticEntityBody) *entity {
	e := newStaticCircleEntity(p, body.radius)
	e.entityType = body.entityType
	e.body.Shape().UserData = e
	return e
}



//---- DTO
type MessageDTO struct {
	Type string      `json:"type"`
	Data interface{} `json:"body"`
}

const dist2px = 120.0

func newDebugEntity(shape *phy.Circle) Entity {
	return &debugCircleShapeEntity{
		BasicEntity: ecs.NewBasic(),
		circle:      shape,
		entityType:  DeathioApi.EntityTypeDebugCircle,
	}
}

type floatwrapper struct {
	f float32
}
