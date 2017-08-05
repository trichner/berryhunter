package main

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
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
	return BerryhunterApi.CreateVec2f(builder, f32ToPx(v.X), f32ToPx(v.Y))
}

func AabbMarshalFlatbuf(aabb model.AABB, builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return BerryhunterApi.CreateAABB(builder, f32ToPx(aabb.Left), f32ToPx(aabb.Bottom), f32ToPx(aabb.Right), f32ToPx(aabb.Upper))
}

func EquipmentMarshalFlatbuf(items []items.Item, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	n := len(items)
	BerryhunterApi.PlayerStartEquipmentVector(builder, n)
	for _, i := range items {
		builder.PrependByte(byte(i.ID))
	}

	return builder.EndVector(n)
}

func PlayerMarshalFlatbuf(p model.PlayerEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	equipment := EquipmentMarshalFlatbuf(p.Equipped(), builder)

	BerryhunterApi.PlayerStart(builder)
	BerryhunterApi.PlayerAddId(builder, p.Basic().ID())

	pos := Vec2fMarshalFlatbuf(p.Position(), builder)
	BerryhunterApi.PlayerAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(p.AABB(), builder)
	BerryhunterApi.PlayerAddAabb(builder, aabb)

	BerryhunterApi.PlayerAddRadius(builder, f32ToU16Px(p.Radius()))
	BerryhunterApi.PlayerAddRotation(builder, p.Angle())
	BerryhunterApi.PlayerAddEntityType(builder, uint16(p.Type()))

	BerryhunterApi.PlayerAddEquipment(builder, equipment)

	vs := p.VitalSigns()
	BerryhunterApi.PlayerAddHealth(builder, byte(vs.Health))
	BerryhunterApi.PlayerAddSatiety(builder, byte(vs.Satiety))
	BerryhunterApi.PlayerAddBodyTemperature(builder, byte(vs.BodyTemperature))

	// TODO
	BerryhunterApi.PlayerAddIsHit(builder, 0)
	BerryhunterApi.PlayerAddActionTick(builder, 0)

	return BerryhunterApi.EntityEnd(builder)
}

func ItemStackMarshalFlatbuf(i *items.ItemStack, builder *flatbuffers.Builder, slot uint8) flatbuffers.UOffsetT {

	return BerryhunterApi.CreateItemStack(builder, byte(i.Item.ID), uint32(i.Count), slot)
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

	BerryhunterApi.GameStateStartInventoryVector(builder, n)
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

	BerryhunterApi.GameStateStart(builder)
	BerryhunterApi.GameStateAddTick(builder, gs.Tick)
	BerryhunterApi.GameStateAddPlayer(builder, player)
	BerryhunterApi.GameStateAddEntities(builder, entities)
	BerryhunterApi.GameStateAddInventory(builder, inventory)

	return BerryhunterApi.GameStateEnd(builder)
}

func GameStateMessageMarshalFlatbuf(builder *flatbuffers.Builder, g *GameState) flatbuffers.UOffsetT {
	gs := g.MarshalFlatbuf(builder)
	return ServerMessageWrapFlatbufMarshal(builder, gs, BerryhunterApi.ServerMessageBodyGameState)
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
			eType = BerryhunterApi.AnyEntityPlayer
		case model.MobEntity:
			marshalled = MobEntityFlatbufMarshal(v, builder)
			eType = BerryhunterApi.AnyEntityMob
		case model.PlaceableEntity:
			marshalled = PlaceableEntityFlatbufMarshal(v, builder)
			eType = BerryhunterApi.AnyEntityPlaceable
		case model.ResourceEntity:
			marshalled = ResourceEntityFlatbufMarshal(v, builder)
			eType = BerryhunterApi.AnyEntityResource
		case model.Entity:
			marshalled = ResourceEntityFlatbufMarshal(v, builder)
			eType = BerryhunterApi.AnyEntityResource
			log.Print("Unknown entity!")
		}
		BerryhunterApi.EntityStart(builder)
		BerryhunterApi.EntityAddE(builder, marshalled)
		BerryhunterApi.EntityAddEType(builder, eType)
		offsets = append(offsets, BerryhunterApi.EntityEnd(builder))
	}

	BerryhunterApi.GameStateStartEntitiesVector(builder, n)
	for _, o := range offsets {
		builder.PrependUOffsetT(o)
	}
	return builder.EndVector(n)
}

func MobEntityFlatbufMarshal(m model.MobEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	BerryhunterApi.MobStart(builder)
	BerryhunterApi.MobAddId(builder, m.Basic().ID())
	BerryhunterApi.MobAddEntityType(builder, BerryhunterApi.EntityTypeMammoth)
	BerryhunterApi.MobAddRotation(builder, m.Angle())

	aabb := AabbMarshalFlatbuf(m.AABB(), builder)
	BerryhunterApi.MobAddAabb(builder, aabb)

	pos := Vec2fMarshalFlatbuf(m.Position(), builder)
	BerryhunterApi.MobAddPos(builder, pos)

	return BerryhunterApi.MobEnd(builder)
}

func PlayerEntityFlatbufMarshal(p model.PlayerEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	// prepend entity specific things
	equipment := EquipmentMarshalFlatbuf(p.Equipped(), builder)

	BerryhunterApi.PlayerStart(builder)
	BerryhunterApi.PlayerAddId(builder, p.Basic().ID())

	pos := Vec2fMarshalFlatbuf(p.Position(), builder)
	BerryhunterApi.PlayerAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(p.AABB(), builder)
	BerryhunterApi.PlayerAddAabb(builder, aabb)

	BerryhunterApi.PlayerAddRadius(builder, f32ToU16Px(p.Radius()))
	BerryhunterApi.PlayerAddRotation(builder, p.Angle())
	BerryhunterApi.PlayerAddEntityType(builder, uint16(p.Type()))

	BerryhunterApi.PlayerAddEquipment(builder, equipment)

	return BerryhunterApi.PlayerEnd(builder)
}

// EntityFlatbufMarshal marshals an Entity interface to its corresponding
// flatbuffer schema
func ResourceEntityFlatbufMarshal(e model.Entity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	BerryhunterApi.ResourceStart(builder)
	BerryhunterApi.ResourceAddId(builder, e.Basic().ID())

	pos := Vec2fMarshalFlatbuf(e.Position(), builder)
	BerryhunterApi.ResourceAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(e.AABB(), builder)
	BerryhunterApi.ResourceAddAabb(builder, aabb)

	BerryhunterApi.ResourceAddRadius(builder, f32ToU16Px(e.Radius()))
	BerryhunterApi.ResourceAddEntityType(builder, uint16(e.Type()))

	return BerryhunterApi.ResourceEnd(builder)
}

func PlaceableEntityFlatbufMarshal(e model.PlaceableEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	BerryhunterApi.PlaceableStart(builder)
	BerryhunterApi.PlaceableAddId(builder, e.Basic().ID())

	pos := Vec2fMarshalFlatbuf(e.Position(), builder)
	BerryhunterApi.PlaceableAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(e.AABB(), builder)
	BerryhunterApi.PlaceableAddAabb(builder, aabb)

	BerryhunterApi.PlaceableAddRadius(builder, f32ToU16Px(e.Radius()))
	BerryhunterApi.PlaceableAddEntityType(builder, uint16(e.Type()))

	BerryhunterApi.PlaceableAddItem(builder, byte(e.Item().ID))

	return BerryhunterApi.PlaceableEnd(builder)
}

func ServerMessageWrapFlatbufMarshal(builder *flatbuffers.Builder, body flatbuffers.UOffsetT, bodyType byte) flatbuffers.UOffsetT {
	BerryhunterApi.ServerMessageStart(builder)
	BerryhunterApi.ServerMessageAddBodyType(builder, bodyType)
	BerryhunterApi.ServerMessageAddBody(builder, body)
	return BerryhunterApi.ServerMessageEnd(builder)
}

// intermediate struct to serialize
type GameState struct {
	Tick      uint64
	Player    model.PlayerEntity
	Entities  []model.Entity
}
