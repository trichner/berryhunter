package main

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"log"
)

//---- helper methods to convert points to pixels
const points2px = 120.0

func f32ToPx(f float32) float32 {
	return f * points2px
}

func f32ToU16Px(f float32) uint16 {
	return uint16(f * points2px)
}

func Vec2fMarshalFlatbuf(v phy.Vec2f, builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return DeathioApi.CreateVec2f(builder, f32ToPx(v.X), f32ToPx(v.Y))
}

func AabbMarshalFlatbuf(aabb model.AABB, builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return DeathioApi.CreateAABB(builder, f32ToPx(aabb.Left), f32ToPx(aabb.Bottom), f32ToPx(aabb.Right), f32ToPx(aabb.Upper))
}

func EquipmentMarshalFlatbuf(items []items.Item, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	n := len(items)
	DeathioApi.PlayerStartEquipmentVector(builder, n)
	for _, i := range items {
		builder.PrependByte(byte(i.ID))
	}

	return builder.EndVector(n)
}

func PlayerMarshalFlatbuf(p model.PlayerEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	equipment := EquipmentMarshalFlatbuf(p.Equipped(), builder)

	DeathioApi.PlayerStart(builder)
	DeathioApi.PlayerAddId(builder, p.Basic().ID())

	pos := Vec2fMarshalFlatbuf(p.Position(), builder)
	DeathioApi.PlayerAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(p.AABB(), builder)
	DeathioApi.PlayerAddAabb(builder, aabb)

	DeathioApi.PlayerAddRadius(builder, f32ToU16Px(p.Radius()))
	DeathioApi.PlayerAddRotation(builder, p.Angle())
	DeathioApi.PlayerAddEntityType(builder, uint16(p.Type()))

	DeathioApi.PlayerAddEquipment(builder, equipment)

	vs := p.VitalSigns()
	DeathioApi.PlayerAddHealth(builder, byte(vs.Health))
	DeathioApi.PlayerAddSatiety(builder, byte(vs.Satiety))
	DeathioApi.PlayerAddBodyTemperature(builder, byte(vs.BodyTemperature))

	// TODO
	DeathioApi.PlayerAddIsHit(builder, 0)
	DeathioApi.PlayerAddActionTick(builder, 0)

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

	entities := EntitiesMarshalFlatbuf(gs.Entities, builder)
	player := PlayerMarshalFlatbuf(gs.Player, builder)
	inventory := InventoryMarshalFlatbuf(gs.Player.Inventory(), builder)

	DeathioApi.GameStateStart(builder)
	DeathioApi.GameStateAddTick(builder, gs.Tick)
	DeathioApi.GameStateAddPlayer(builder, player)
	DeathioApi.GameStateAddEntities(builder, entities)
	DeathioApi.GameStateAddInventory(builder, inventory)

	return DeathioApi.GameStateEnd(builder)
}

// EntitiesMarshalFlatbuf marshals a list of Entity interfaces
func EntitiesMarshalFlatbuf(entities []model.Entity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	n := len(entities)

	offsets := make([]flatbuffers.UOffsetT, n)
	for _, e := range entities {
		var marshalled flatbuffers.UOffsetT
		var eType byte

		switch v := e.(type) {
		case model.PlayerEntity:
			marshalled = PlayerEntityFlatbufMarshal(v, builder)
			eType = DeathioApi.AnyEntityPlayer
		case model.MobEntity:
			marshalled = MobEntityFlatbufMarshal(v, builder)
			eType = DeathioApi.AnyEntityMob
		case model.PlaceableEntity:
			marshalled = PlaceableEntityFlatbufMarshal(v, builder)
			eType = DeathioApi.AnyEntityPlaceable
		case model.ResourceEntity:
			marshalled = ResourceEntityFlatbufMarshal(v, builder)
			eType = DeathioApi.AnyEntityResource
		case model.Entity:
			marshalled = ResourceEntityFlatbufMarshal(v, builder)
			eType = DeathioApi.AnyEntityResource
			log.Print("Unknown entity!")
		}
		DeathioApi.EntityStart(builder)
		DeathioApi.EntityAddE(builder, marshalled)
		DeathioApi.EntityAddEType(builder, eType)
		offsets = append(offsets, DeathioApi.EntityEnd(builder))
	}

	DeathioApi.GameStateStartEntitiesVector(builder, n)
	for _, o := range offsets {
		builder.PrependUOffsetT(o)
	}
	return builder.EndVector(n)
}

func MobEntityFlatbufMarshal(m model.MobEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	DeathioApi.MobStart(builder)
	DeathioApi.MobAddId(builder, m.Basic().ID())
	DeathioApi.MobAddEntityType(builder, DeathioApi.EntityTypeMammoth)
	DeathioApi.MobAddRotation(builder, m.Angle())

	aabb := AabbMarshalFlatbuf(m.AABB(), builder)
	DeathioApi.MobAddAabb(builder, aabb)

	pos := Vec2fMarshalFlatbuf(m.Position(), builder)
	DeathioApi.MobAddPos(builder, pos)

	return DeathioApi.MobEnd(builder)
}

func PlayerEntityFlatbufMarshal(p model.PlayerEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	// prepend entity specific things
	equipment := EquipmentMarshalFlatbuf(p.Equipped(), builder)

	DeathioApi.PlayerStart(builder)
	DeathioApi.PlayerAddId(builder, p.Basic().ID())

	pos := Vec2fMarshalFlatbuf(p.Position(), builder)
	DeathioApi.PlayerAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(p.AABB(), builder)
	DeathioApi.PlayerAddAabb(builder, aabb)

	DeathioApi.PlayerAddRadius(builder, f32ToU16Px(p.Radius()))
	DeathioApi.PlayerAddRotation(builder, p.Angle())
	DeathioApi.PlayerAddEntityType(builder, uint16(p.Type()))

	DeathioApi.PlayerAddEquipment(builder, equipment)

	return DeathioApi.PlayerEnd(builder)
}

// EntityFlatbufMarshal marshals an Entity interface to its corresponding
// flatbuffer schema
func ResourceEntityFlatbufMarshal(e model.Entity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	DeathioApi.ResourceStart(builder)
	DeathioApi.ResourceAddId(builder, e.Basic().ID())

	pos := Vec2fMarshalFlatbuf(e.Position(), builder)
	DeathioApi.ResourceAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(e.AABB(), builder)
	DeathioApi.ResourceAddAabb(builder, aabb)

	DeathioApi.ResourceAddRadius(builder, f32ToU16Px(e.Radius()))
	DeathioApi.ResourceAddEntityType(builder, uint16(e.Type()))

	return DeathioApi.ResourceEnd(builder)
}

func PlaceableEntityFlatbufMarshal(e model.PlaceableEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	DeathioApi.PlaceableStart(builder)
	DeathioApi.PlaceableAddId(builder, e.Basic().ID())

	pos := Vec2fMarshalFlatbuf(e.Position(), builder)
	DeathioApi.PlaceableAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(e.AABB(), builder)
	DeathioApi.PlaceableAddAabb(builder, aabb)

	DeathioApi.PlaceableAddRadius(builder, f32ToU16Px(e.Radius()))
	DeathioApi.PlaceableAddEntityType(builder, uint16(e.Type()))

	DeathioApi.PlaceableAddItem(builder, byte(e.Item().ID))

	return DeathioApi.PlaceableEnd(builder)
}

// intermediate struct to serialize
type GameState struct {
	Tick      uint64
	Player    model.PlayerEntity
	Entities  []model.Entity
}
