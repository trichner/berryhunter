package main

import (
	"engo.io/ecs"
	"github.com/trichner/death-io/backend/wrand"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"math/rand"
	"github.com/vova616/chipmunk/transform"
	"github.com/trichner/death-io/backend/DeathioApi"
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
	circle     *chipmunk.Shape
	entityType EntityType
}

func (e *debugCircleShapeEntity) Type() EntityType {
	return e.entityType
}

func (e *debugCircleShapeEntity) Position() vect.Vect {

	t := transform.NewTransform(e.circle.Body.Position(), e.circle.Body.Angle())
	return t.TransformVect(e.circle.GetAsCircle().Position)
}

func (e *debugCircleShapeEntity) X() float32 {
	return float32(e.Position().X)
}

func (e *debugCircleShapeEntity) Y() float32 {
	return float32(e.Position().Y)
}

func (e *debugCircleShapeEntity) AABB() AABB {
	return AABB(e.circle.AABB())
}

func (e *debugCircleShapeEntity) Angle() float32 {
	return 0
}

func (e *debugCircleShapeEntity) Radius() float32 {
	return float32(e.circle.GetAsCircle().Radius)
}

//---- entity
type entity struct {
	ecs.BasicEntity
	body       *chipmunk.Body
	entityType EntityType
	radius     float32
}

func (e *entity) Type() EntityType {
	return e.entityType
}

func (e *entity) SetPosition(x, y float32) {
	e.body.SetPosition(vect.Vect{vect.Float(x), vect.Float(y)})
}

func (e *entity) X() float32 {
	return float32(e.body.Position().X)
}

func (e *entity) Y() float32 {
	return float32(e.body.Position().Y)
}

func (e *entity) AABB() AABB {
	return AABB(e.body.Shapes[0].AABB())
}

func (e *entity) Angle() float32 {
	return float32(e.body.Angle())
}

func (e *entity) Radius() float32 {
	return e.radius
}

func NewRandomEntityFrom(bodies []staticEntityBody, rnd *rand.Rand) *entity {
	choices := []wrand.Choice{}
	for _, b := range bodies {
		choices = append(choices, wrand.Choice{Weight: b.weight, Choice: b})
	}

	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(staticEntityBody)
	return NewStaticEntityWithBody(&selected)
}

func NewStaticEntityWithBody(body *staticEntityBody) *entity {
	e := newStaticCircleEntity(0, 0, body.radius)
	e.entityType = body.entityType
	e.body.UserData = e
	return e
}



//---- DTO
type MessageDTO struct {
	Type string      `json:"type"`
	Data interface{} `json:"body"`
}

const dist2px = 120.0

func newDebugEntity(shape *chipmunk.Shape) Entity {
	return &debugCircleShapeEntity{
		BasicEntity: ecs.NewBasic(),
		circle:      shape,
		entityType:  DeathioApi.EntityTypeDebugCircle,
	}
}

type floatwrapper struct {
	f float32
}
