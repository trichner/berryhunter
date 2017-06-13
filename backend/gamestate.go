package main

import (
	deathio "github.com/trichner/death-io/backend/DeathioApi"
	"github.com/vova616/chipmunk"
	"github.com/google/flatbuffers/go"
	"github.com/vova616/chipmunk/vect"
)

const points2px = 120.0

func f32ToPx(f float32) float32 {
	return f * points2px
}

func floatToPx(f vect.Float) float32 {
	return float32(f) * points2px
}

func f32ToU16Px(f float32) uint16 {
	return uint16(f * points2px)
}

type AABB chipmunk.AABB

func (aabb AABB) FlatbufMarshal(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	return deathio.CreateAABB(builder, floatToPx(aabb.Lower.X), floatToPx(aabb.Lower.Y), floatToPx(aabb.Upper.X), floatToPx(aabb.Upper.Y))
}

type entities []Entity

func (es entities) FlatbufMarshal(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	entities := []Entity(es)
	n := len(entities)

	offsets := make([]flatbuffers.UOffsetT, n)
	for _, e := range entities {
		offsets = append(offsets, fbMarshalEntity(builder, e))
	}

	deathio.GameStateStartEntitiesVector(builder, n)
	for _, o := range offsets {
		builder.PrependUOffsetT(o)
	}
	return builder.EndVector(n)
}

func (gs *GameState) FlatbufMarshal(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	entities := entities(gs.Entities).FlatbufMarshal(builder)

	deathio.GameStateStart(builder)
	deathio.GameStateAddTick(builder, gs.Tick)
	deathio.GameStateAddPlayerId(builder, gs.PlayerID)
	deathio.GameStateAddEntities(builder, entities)

	return deathio.GameStateEnd(builder)
}

func fbMarshalEntity(builder *flatbuffers.Builder, e Entity) flatbuffers.UOffsetT {

	deathio.EntityStart(builder)
	deathio.EntityAddId(builder, e.ID())

	pos := deathio.CreateVec2f(builder, f32ToPx(e.X()), f32ToPx(e.Y()))
	deathio.EntityAddPos(builder, pos)

	aabb := e.AABB().FlatbufMarshal(builder)
	deathio.EntityAddAabb(builder, aabb)

	deathio.EntityAddRadius(builder, f32ToU16Px(e.Radius()))
	deathio.EntityAddRotation(builder, e.Angle())
	deathio.EntityAddType(builder, uint16(e.Type()))

	return deathio.EntityEnd(builder)
}

type GameState struct {
	Tick     uint64
	PlayerID uint64
	Entities []Entity
}
