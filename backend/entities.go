package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
)

const (
	typeNone            = "NONE"
	typeRabbit          = "Rabbit"
	typeRoundTree       = "RoundTree"
	typePlayer          = "Character"
	typeSabreToothTiger = "SabreToothTiger"
)

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

func (e *entity) X() float32 {
	return float32(e.body.Position().X)
}

func (e *entity) Y() float32 {
	return float32(e.body.Position().Y)
}

func (e *entity) Body() chipmunk.Body {
	return e.body
}

func NewSabretoothTiger() *entity {
	e := newCircleEntity(0, 0, 1, 1)
	e.entityType = typeSabreToothTiger
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
		e.X(),
		e.Y(),
		e.Type(),
	}
}

func mapToMessageDTO(e Entity) *MessageDTO {
	return &MessageDTO{
		"OBJECT",
		mapToEntityDTO(e),
	}
}
