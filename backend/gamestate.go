package main

import (
	deathio "github.com/trichner/death-io/backend/DeathioApi"
	"github.com/vova616/chipmunk"
	"github.com/google/flatbuffers/go"
	"github.com/vova616/chipmunk/vect"
)

//---- helper methods to convert points to pixels
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

// AABB is an alias to not expose transitive dependencies
type AABB chipmunk.AABB

// MarshalFlatbuf implements FlatbufCodec for AABBs
func (aabb AABB) MarshalFlatbuf(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	return deathio.CreateAABB(builder, floatToPx(aabb.Lower.X), floatToPx(aabb.Lower.Y), floatToPx(aabb.Upper.X), floatToPx(aabb.Upper.Y))
}

// MarshalFlatbuf implements FlatbufCodec for GameState
func (gs *GameState) MarshalFlatbuf(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	entities := EntitiesFlatbufMarshal(gs.Entities, builder)

	deathio.GameStateStart(builder)
	deathio.GameStateAddTick(builder, gs.Tick)
	deathio.GameStateAddPlayerId(builder, gs.PlayerID)
	deathio.GameStateAddEntities(builder, entities)

	return deathio.GameStateEnd(builder)
}

// EntitiesFlatbufMarshal marshals a list of Entity interfaces
func EntitiesFlatbufMarshal(entities []Entity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	n := len(entities)

	offsets := make([]flatbuffers.UOffsetT, n)
	for _, e := range entities {
		offsets = append(offsets, EntityFlatbufMarshal(e, builder))
	}

	deathio.GameStateStartEntitiesVector(builder, n)
	for _, o := range offsets {
		builder.PrependUOffsetT(o)
	}
	return builder.EndVector(n)
}

// EntityFlatbufMarshal marshals an Entity interface to its corresponding
// flatbuffer schema
func EntityFlatbufMarshal(e Entity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	deathio.EntityStart(builder)
	deathio.EntityAddId(builder, e.ID())

	pos := deathio.CreateVec2f(builder, f32ToPx(e.X()), f32ToPx(e.Y()))
	deathio.EntityAddPos(builder, pos)

	aabb := e.AABB().MarshalFlatbuf(builder)
	deathio.EntityAddAabb(builder, aabb)

	deathio.EntityAddRadius(builder, f32ToU16Px(e.Radius()))
	deathio.EntityAddRotation(builder, e.Angle())
	deathio.EntityAddType(builder, uint16(e.Type()))

	return deathio.EntityEnd(builder)
}

// intermediate struct to serialize
type GameState struct {
	Tick     uint64
	PlayerID uint64
	Entities []Entity
}
