package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
	"math/rand"
	"github.com/trichner/death-io/backend/wrand"
	"github.com/vova616/chipmunk/vect"
)

const (
	typeNone          = "NONE"
	typeRabbit        = "Rabbit"
	typeRoundTree     = "RoundTree"
	typeMarioTree     = "MarioTree"
	typePlayer        = "Character"
	typeSaberToothCat = "SaberToothCat"
)

var foliage = []entityBody{
	entityBody{
		typeRoundTree,
		500,
		1,
		1,
	},
	entityBody{
		typeMarioTree,
		100,
		2,
		1,
	},
}

var ores = []entityBody{
	entityBody{
		typeRoundTree,
		100,
		1,
		1,
	},
}

var mobs = []entityBody{
	entityBody{
		typeSaberToothCat,
		100,
		1,
		1,
	},
	entityBody{
		typeRabbit,
		100,
		1,
		1,
	},
}

type entityBody struct {
	entityType   string
	weight       int
	radius, mass float32
}

//---- basic interface with getters
type Entity interface {
	ID() uint64
	X() float32
	Y() float32
	Type() string
	Body() chipmunk.Body
}

//---- entity
type entity struct {
	ecs.BasicEntity
	body       chipmunk.Body
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

func (e *entity) Body() chipmunk.Body {
	return e.body
}

func NewRandomEntityFrom(bodies []entityBody, rnd *rand.Rand) *entity {
	choices := []wrand.Choice{}
	for _, b := range bodies {
		choices = append(choices, wrand.Choice{Weight: b.weight, Choice: &b})
	}

	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(*entityBody)
	return NewEntityWithBody(selected)
}

func NewEntityWithBody(body *entityBody) *entity {
	e := newCircleEntity(0, 0, body.radius, body.mass)
	e.entityType = body.entityType
	return &e
}

func NewRabbit() *entity {
	e := newCircleEntity(40, 0, 1, 1)
	e.entityType = typeRabbit
	return &e
}

func NewSaberToothCat() *entity {
	e := newCircleEntity(0, 0, 1, 1)
	e.entityType = typeSaberToothCat
	return &e
}

//---- player
type player struct {
	entity
	Health uint
	Hunger uint
	client *Client
}

func NewPlayer(c *Client) *player {
	e := newCircleEntity(0, 0, 1, 1)
	e.entityType = typePlayer
	return &player{entity: e, client: c}
}

//---- DTO
type MessageDTO struct {
	Type string `json:"type"`
	Data interface{} `json:"body"`
}

func mapToEntityDTO(e Entity) *EntityDTO {

	return &EntityDTO{
		e.ID(),
		e.X() * 100.0,
		e.Y() * 100.0,
		e.Type(),
	}
}

func mapToMessageDTO(e Entity) *MessageDTO {
	return &MessageDTO{
		"OBJECT",
		mapToEntityDTO(e),
	}
}
