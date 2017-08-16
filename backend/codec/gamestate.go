package codec

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"log"
)

func Vec2fMarshalFlatbuf(builder *flatbuffers.Builder, v phy.Vec2f) flatbuffers.UOffsetT {
	return BerryhunterApi.CreateVec2f(builder, f32ToPx(v.X), f32ToPx(v.Y))
}

func AabbMarshalFlatbuf(aabb model.AABB, builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return BerryhunterApi.CreateAABB(builder, f32ToPx(aabb.Left), f32ToPx(aabb.Bottom), f32ToPx(aabb.Right), f32ToPx(aabb.Upper))
}

func EquipmentMarshalFlatbuf(items []items.Item, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	n := len(items)
	BerryhunterApi.CharacterStartEquipmentVector(builder, n)
	for _, i := range items {
		builder.PrependByte(byte(i.ID))
	}

	return builder.EndVector(n)
}

func characterCommonMarshalFlatbuf(builder *flatbuffers.Builder, p model.PlayerEntity) {

	// prepend entity specific things
	equipment := EquipmentMarshalFlatbuf(p.Equipped(), builder)
	name := builder.CreateString(p.Name())

	// populate player table
	BerryhunterApi.CharacterStart(builder)
	BerryhunterApi.CharacterAddId(builder, p.Basic().ID())
	BerryhunterApi.CharacterAddName(builder, name)

	pos := Vec2fMarshalFlatbuf(builder, p.Position())
	BerryhunterApi.CharacterAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(p.AABB(), builder)
	BerryhunterApi.CharacterAddAabb(builder, aabb)

	BerryhunterApi.CharacterAddRadius(builder, f32ToU16Px(p.Radius()))
	BerryhunterApi.CharacterAddRotation(builder, p.Angle())
	BerryhunterApi.CharacterAddEntityType(builder, uint16(p.Type()))

	BerryhunterApi.CharacterAddEquipment(builder, equipment)
}

// general player as seen by other players
func CharacterEntityFlatbufMarshal(p model.PlayerEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	// prepend entity specific things
	characterCommonMarshalFlatbuf(builder, p)
	return BerryhunterApi.CharacterEnd(builder)
}

// player marshalled for the acting player
func CharacterMarshalFlatbuf(p model.PlayerEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	characterCommonMarshalFlatbuf(builder, p)
	// other stuffz
	vs := p.VitalSigns()
	BerryhunterApi.CharacterAddHealth(builder, vs.Health.UInt32())
	BerryhunterApi.CharacterAddSatiety(builder, vs.Satiety.UInt32())
	BerryhunterApi.CharacterAddBodyTemperature(builder, vs.BodyTemperature.UInt32())

	return BerryhunterApi.EntityEnd(builder)
}

func SpectatorMarshalFlatbuf(b *flatbuffers.Builder, s model.Spectator) flatbuffers.UOffsetT {

	BerryhunterApi.SpectatorStart(b)
	BerryhunterApi.SpectatorAddId(b, s.Basic().ID())
	pos := Vec2fMarshalFlatbuf(b, s.Position())
	BerryhunterApi.SpectatorAddPos(b, pos)
	return BerryhunterApi.SpectatorEnd(b)
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
func (gs *CharacterGameState) MarshalFlatbuf(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	entities := EntitiesMarshalFlatbuf(gs.Entities, builder)
	character := CharacterMarshalFlatbuf(gs.Player, builder)
	inventory := InventoryMarshalFlatbuf(gs.Player.Inventory(), builder)

	BerryhunterApi.GameStateStart(builder)
	BerryhunterApi.GameStateAddTick(builder, gs.Tick)

	BerryhunterApi.GameStateAddPlayerType(builder, BerryhunterApi.PlayerCharacter)
	BerryhunterApi.GameStateAddPlayer(builder, character)

	BerryhunterApi.GameStateAddEntities(builder, entities)
	BerryhunterApi.GameStateAddInventory(builder, inventory)

	return BerryhunterApi.GameStateEnd(builder)
}

func CharacterGameStateMessageMarshalFlatbuf(builder *flatbuffers.Builder, g *CharacterGameState) flatbuffers.UOffsetT {
	gs := g.MarshalFlatbuf(builder)
	return ServerMessageWrapFlatbufMarshal(builder, gs, BerryhunterApi.ServerMessageBodyGameState)
}

// MarshalFlatbuf implements FlatbufCodec for GameState
func (gs *SpectatorGameState) MarshalFlatbuf(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	entities := EntitiesMarshalFlatbuf(gs.Entities, builder)
	spectator := SpectatorMarshalFlatbuf(builder, gs.Spectator)

	BerryhunterApi.GameStateStart(builder)
	BerryhunterApi.GameStateAddTick(builder, gs.Tick)
	BerryhunterApi.GameStateAddPlayerType(builder, BerryhunterApi.PlayerSpectator)
	BerryhunterApi.GameStateAddPlayer(builder, spectator)
	BerryhunterApi.GameStateAddEntities(builder, entities)

	return BerryhunterApi.GameStateEnd(builder)
}

func SpectatorGameStateMessageMarshalFlatbuf(builder *flatbuffers.Builder, g *SpectatorGameState) flatbuffers.UOffsetT {
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
			marshalled = CharacterEntityFlatbufMarshal(v, builder)
			eType = BerryhunterApi.AnyEntityCharacter
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
	BerryhunterApi.MobAddEntityType(builder, uint16(m.Type()))
	BerryhunterApi.MobAddRotation(builder, m.Angle())

	aabb := AabbMarshalFlatbuf(m.AABB(), builder)
	BerryhunterApi.MobAddAabb(builder, aabb)

	pos := Vec2fMarshalFlatbuf(builder, m.Position())
	BerryhunterApi.MobAddPos(builder, pos)

	return BerryhunterApi.MobEnd(builder)
}

// EntityFlatbufMarshal marshals an Entity interface to its corresponding
// flatbuffer schema
func ResourceEntityFlatbufMarshal(e model.Entity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	BerryhunterApi.ResourceStart(builder)
	BerryhunterApi.ResourceAddId(builder, e.Basic().ID())

	pos := Vec2fMarshalFlatbuf(builder, e.Position())
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

	pos := Vec2fMarshalFlatbuf(builder, e.Position())
	BerryhunterApi.PlaceableAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(e.AABB(), builder)
	BerryhunterApi.PlaceableAddAabb(builder, aabb)

	BerryhunterApi.PlaceableAddRadius(builder, f32ToU16Px(e.Radius()))
	BerryhunterApi.PlaceableAddEntityType(builder, uint16(e.Type()))

	BerryhunterApi.PlaceableAddItem(builder, byte(e.Item().ID))

	return BerryhunterApi.PlaceableEnd(builder)
}

// intermediate struct to serialize
type SpectatorGameState struct {
	Tick      uint64
	Spectator model.Spectator
	Entities  []model.Entity
}

// intermediate struct to serialize
type CharacterGameState struct {
	Tick     uint64
	Player   model.PlayerEntity
	Entities []model.Entity
}
