package main

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

//---- helper methods to convert points to pixels
const points2px = 120.0

func f32ToPx(f float32) float32 {
	return f * points2px
}

func f32ToU16Px(f float32) uint16 {
	return uint16(f * points2px)
}

func AabbMarshalFlatbuf(aabb model.AABB, builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return DeathioApi.CreateAABB(builder, f32ToPx(aabb.Left), f32ToPx(aabb.Bottom), f32ToPx(aabb.Right), f32ToPx(aabb.Upper))
}

func EquipmentMarshalFlatbuf(items []items.Item, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	n := len(items)
	DeathioApi.EntityStartEquipmentVector(builder, n)
	for _, i := range items {
		builder.PrependByte(byte(i.ID))
	}

	return builder.EndVector(n)
}

func PlayerMarshalFlatbuf(p model.PlayerEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	equipment := EquipmentMarshalFlatbuf(p.Equipped(), builder)

	DeathioApi.EntityStart(builder)
	DeathioApi.EntityAddId(builder, p.Basic().ID())

	pos := DeathioApi.CreateVec2f(builder, f32ToPx(p.X()), f32ToPx(p.Y()))
	DeathioApi.EntityAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(p.AABB(), builder)
	DeathioApi.EntityAddAabb(builder, aabb)

	DeathioApi.EntityAddRadius(builder, f32ToU16Px(p.Radius()))
	DeathioApi.EntityAddRotation(builder, p.Angle())
	DeathioApi.EntityAddEntityType(builder, uint16(p.Type()))

	DeathioApi.EntityAddEquipment(builder, equipment)

	// TODO
	DeathioApi.EntityAddIsHit(builder, 0)
	DeathioApi.EntityAddActionTick(builder, 0)

	return DeathioApi.EntityEnd(builder)
}

func ItemStackMarshalFlatbuf(i *items.ItemStack, builder *flatbuffers.Builder, slot uint8) flatbuffers.UOffsetT {

	return DeathioApi.CreateItemStack(builder, byte(i.Item.ID), uint32(i.Count), slot)
}

func InventoryMarshalFlatbuf(inventory *items.Inventory, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	inventoryItems := inventory.Items()

	// only serialize non-nil elements
	n := 0
	for _, item := range inventoryItems {
		if item != nil {
			n++
		}
	}

	DeathioApi.GameStateStartInventoryVector(builder, n)
	for idx, item := range inventoryItems {
		if item != nil {
			ItemStackMarshalFlatbuf(item, builder, uint8(idx))
		}
	}
	return builder.EndVector(n)
}
// MarshalFlatbuf implements FlatbufCodec for GameState
func (gs *GameState) MarshalFlatbuf(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	entities := EntitiesFlatbufMarshal(gs.Entities, builder)
	player := PlayerMarshalFlatbuf(gs.Player, builder)
	inventory := InventoryMarshalFlatbuf(gs.Player.Inventory(), builder)

	DeathioApi.GameStateStart(builder)
	DeathioApi.GameStateAddTick(builder, gs.Tick)
	DeathioApi.GameStateAddPlayer(builder, player)
	DeathioApi.GameStateAddEntities(builder, entities)
	DeathioApi.GameStateAddInventory(builder, inventory)

	return DeathioApi.GameStateEnd(builder)
}

// EntitiesFlatbufMarshal marshals a list of Entity interfaces
func EntitiesFlatbufMarshal(entities []model.Entity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	n := len(entities)

	offsets := make([]flatbuffers.UOffsetT, n)
	for _, e := range entities {
		offsets = append(offsets, EntityFlatbufMarshal(e, builder))
	}

	DeathioApi.GameStateStartEntitiesVector(builder, n)
	for _, o := range offsets {
		builder.PrependUOffsetT(o)
	}
	return builder.EndVector(n)
}

// EntityFlatbufMarshal marshals an Entity interface to its corresponding
// flatbuffer schema
func EntityFlatbufMarshal(e model.Entity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	// prepend entity specific things
	var equipment flatbuffers.UOffsetT
	switch v := e.(type) {
	case model.PlayerEntity:
		equipment = EquipmentMarshalFlatbuf(v.Equipped(), builder)
	}

	DeathioApi.EntityStart(builder)
	DeathioApi.EntityAddId(builder, e.Basic().ID())

	pos := DeathioApi.CreateVec2f(builder, f32ToPx(e.X()), f32ToPx(e.Y()))
	DeathioApi.EntityAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(e.AABB(), builder)
	DeathioApi.EntityAddAabb(builder, aabb)

	DeathioApi.EntityAddRadius(builder, f32ToU16Px(e.Radius()))
	DeathioApi.EntityAddRotation(builder, e.Angle())
	DeathioApi.EntityAddEntityType(builder, uint16(e.Type()))

	if equipment > 0 {
		DeathioApi.EntityAddEquipment(builder, equipment)
	}

	return DeathioApi.EntityEnd(builder)
}

// intermediate struct to serialize
type GameState struct {
	Tick      uint64
	Player    model.PlayerEntity
	Entities  []model.Entity
}
