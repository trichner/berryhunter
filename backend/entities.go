package main

import (
	"engo.io/ecs"
	"github.com/trichner/death-io/backend/wrand"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"math/rand"
	"math"
	"github.com/trichner/death-io/backend/net"
)

const (
	typeNone          = "NONE"
	typeBorder        = "Border"
	typeRoundTree     = "RoundTree"
	typeMarioTree     = "MarioTree"
	typePlayer        = "Character"
	typeSaberToothCat = "SaberToothCat"
	typeStone         = "Stone"
	typeGold          = "Gold"
	typeBerryBush     = "BerryBush"
)

//---- basic interface with getters
type Entity interface {
	ID() uint64
	X() float32
	Y() float32
	Type() string
	Body() *chipmunk.Body
}

//---- entity
type entity struct {
	ecs.BasicEntity
	body       *chipmunk.Body
	entityType string
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

func (e *entity) Body() *chipmunk.Body {
	return e.body
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
	Health uint
	Hunger uint
	client *net.Client
}

func NewPlayer(c *net.Client) *player {
	e := newCircleEntity(0.5, 1)
	e.entityType = typePlayer
	return &player{entity: e, client: c}
}

//---- DTO
type MessageDTO struct {
	Type string      `json:"type"`
	Data interface{} `json:"body"`
}

const dist2px = 120.0

func mapToEntityDTO(e Entity) *EntityDTO {

	bdy := e.Body()
	return &EntityDTO{
		Id:   e.ID(),
		X:    e.X() * dist2px,
		Y:    e.Y() * dist2px,
		Type: e.Type(),
		Aabb: mapToAabbDTO(bdy),
	}
}

type floatwrapper struct {
	f float32
}

func mapToAabbDTO(b *chipmunk.Body) *AabbDTO {
	if b == nil || len(b.Shapes) == 0 {
		return nil
	}
	s := b.Shapes[0]
	aabb := &AabbDTO{
		LowerX: sanititzeFloat(float32(s.AABB().Lower.X) * dist2px),
		LowerY: sanititzeFloat(float32(s.AABB().Lower.Y) * dist2px),
		UpperX: sanititzeFloat(float32(s.AABB().Upper.X) * dist2px),
		UpperY: sanititzeFloat(float32(s.AABB().Upper.Y) * dist2px),
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
