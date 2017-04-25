package main

import (
	"engo.io/ecs"
	"github.com/vova616/chipmunk"
)

const (
	typeNone            = "NONE"
	typeRoundTree       = "SabreToothTiger"
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
	chipmunk.Body
}

func (e *entity) Type() string {
	return typeRoundTree
}

func (e *entity) X() float32 {
	return float32(e.Position().X)
}

func (e *entity) Y() float32 {
	return float32(e.Position().Y)
}

//---- SabreToothTiger
type SabreToothTiger struct {
	entity
}

func (p *SabreToothTiger) Type() string {
	return typeSabreToothTiger
}

//---- Player
type Player struct {
	entity
	Health uint
	Hunger uint
}

func (p *Player) Type() string {
	return typePlayer
}

//---- DTO
type EntityDTO struct {
	Id   uint64  `json:"id"`
	X    float32 `json:"x"`
	Y    float32 `json:"y"`
	Type string `json:"object"`
}

type MessageDTO struct {
	Type string `json:"type"`
	Data interface{} `json:"body"`
}

func mapToDTO(e *entity) *MessageDTO {
	return &MessageDTO{
		"OBJECT",
		EntityDTO{
			e.ID(),
			e.X(),
			e.Y(),
			e.Type(),
		},
	}
}
