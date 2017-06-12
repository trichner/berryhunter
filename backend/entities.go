package main

import (
	"engo.io/ecs"
	"github.com/trichner/death-io/backend/wrand"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"math/rand"
	"math"
	"github.com/trichner/death-io/backend/net"
	"github.com/vova616/chipmunk/transform"
)

const (
	typeDebugCircle   = "DebugCircle"
	typeBorder        = "Border"
	typeRoundTree     = "RoundTree"
	typeMarioTree     = "MarioTree"
	typePlayer        = "Character"
	typeSaberToothCat = "SaberToothCat"
	typeStone         = "Stone"
	typeBronze        = "Bronze"
	typeBerryBush     = "BerryBush"
)

//---- basic interface with getters
type Entity interface {
	ID() uint64
	X() float32
	Y() float32
	Angle() float32
	Radius() float32
	Type() string
	AABB() chipmunk.AABB
}

//
type debugCircleShapeEntity struct {
	ecs.BasicEntity
	circle     *chipmunk.Shape
	entityType string
}

func (e *debugCircleShapeEntity) Type() string {
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

func (e *debugCircleShapeEntity) AABB() chipmunk.AABB {
	return e.circle.AABB()
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
	entityType string
	radius     float32
}

func (e *entity) Type() string {
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

func (e *entity) AABB() chipmunk.AABB {
	return e.body.Shapes[0].AABB()
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

//---- player
type player struct {
	*entity
	hitSensor *chipmunk.Shape
	Health    uint
	Hunger    uint
	client    *net.Client
}

const playerCollisionGroup = -1
func NewPlayer(c *net.Client) *player {
	e := newCircleEntity(0.5, 1)

	sensor := chipmunk.NewCircle(vect.Vect{0.5, 0}, 0.5)
	sensor.IsSensor = true
	sensor.Layer = ressourceCollisionLayer
	sensor.UserData = "ITEM"

	e.body.AddShape(sensor)
	e.body.CallbackHandler = &Collidable{}
	e.body.UserData = e

	e.body.UpdateShapes()

	e.entityType = typePlayer
	for _, s := range e.body.Shapes {
		s.Group = playerCollisionGroup
	}
	p := &player{entity: e, client: c, hitSensor: sensor}
	p.body.UserData = p
	return p
}

//---- DTO
type MessageDTO struct {
	Type string      `json:"type"`
	Data interface{} `json:"body"`
}

const dist2px = 120.0

func mapToEntityDTO(e Entity) *EntityDTO {

	return &EntityDTO{
		Id:     e.ID(),
		X:      e.X() * dist2px,
		Y:      e.Y() * dist2px,
		Rot:    e.Angle(),
		Radius: e.Radius() * dist2px,
		Type:   e.Type(),
		Aabb:   mapToAabbDTO(e.AABB()),
	}
}

func newDebugEntity(shape *chipmunk.Shape) Entity {
	return &debugCircleShapeEntity{
		BasicEntity: ecs.NewBasic(),
		circle:      shape,
		entityType:  typeDebugCircle,
	}
}

type floatwrapper struct {
	f float32
}

func mapToAabbDTO(bb chipmunk.AABB) *AabbDTO {
	aabb := &AabbDTO{
		LowerX: sanititzeFloat(float32(bb.Lower.X) * dist2px),
		LowerY: sanititzeFloat(float32(bb.Lower.Y) * dist2px),
		UpperX: sanititzeFloat(float32(bb.Upper.X) * dist2px),
		UpperY: sanititzeFloat(float32(bb.Upper.Y) * dist2px),
	}
	return aabb
}

func sanititzeFloat(f float32) *float32 {
	z := float32(0)
	if math.IsNaN(float64(f)) {
		return &z
	}
	return &f
}
