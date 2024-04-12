package codec

import (
	"log"

	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
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
	equipment := EquipmentMarshalFlatbuf(p.Equipment().Equipped(), builder)
	name := builder.CreateString(p.Name())
	statusEffects := StatusEffectsMarshal(builder, p)

	// populate player table
	BerryhunterApi.CharacterStart(builder)
	BerryhunterApi.CharacterAddId(builder, p.Basic().ID())
	BerryhunterApi.CharacterAddName(builder, name)
	BerryhunterApi.CharacterAddStatusEffects(builder, statusEffects)
	ca := p.CurrentAction()
	if ca != nil {
		BerryhunterApi.CharacterAddCurrentAction(builder, ongoingActionMarshalFlatbuf(builder, ca))
	}

	pos := Vec2fMarshalFlatbuf(builder, p.Position())
	BerryhunterApi.CharacterAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(p.AABB(), builder)
	BerryhunterApi.CharacterAddAabb(builder, aabb)

	BerryhunterApi.CharacterAddRadius(builder, f32ToU16Px(p.Radius()))
	BerryhunterApi.CharacterAddRotation(builder, p.Angle())
	BerryhunterApi.CharacterAddEntityType(builder, BerryhunterApi.EntityType(p.Type()))

	BerryhunterApi.CharacterAddEquipment(builder, equipment)
}

func playerActionTypeMarshal(action model.PlayerActionType) BerryhunterApi.ActionType {
	return BerryhunterApi.ActionType(action) // for now the enums ordinals match exactly
}

func ongoingActionMarshalFlatbuf(builder *flatbuffers.Builder, action model.PlayerAction) flatbuffers.UOffsetT {
	tr := uint16(action.TicksRemaining())
	item := action.Item()
	itemId := byte(item.ItemDefinition.ID)
	return BerryhunterApi.CreateOngoingAction(builder, tr, playerActionTypeMarshal(action.Type()), itemId)
}

func StatusEffectsMarshal(builder *flatbuffers.Builder, e model.StatusEntity) flatbuffers.UOffsetT {
	se := e.StatusEffects().Effects()
	if se == nil || len(se) == 0 {
		builder.StartVector(1, 0, 0)
		return builder.EndVector(0)
	}

	builder.StartVector(1, len(se), 0)
	for _, k := range se {
		builder.PrependUint16(uint16(k))
	}
	return builder.EndVector(len(se))
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
		var eType BerryhunterApi.AnyEntity

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
		default:
			log.Panicf(" Unknown entity: %+v", e)
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

// EntityFlatbufMarshal marshals an Entity interface to its corresponding
// flatbuffer schema
func ResourceEntityFlatbufMarshal(e model.ResourceEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	statusEffects := StatusEffectsMarshal(builder, e)

	BerryhunterApi.ResourceStart(builder)
	BerryhunterApi.ResourceAddId(builder, e.Basic().ID())
	BerryhunterApi.ResourceAddStatusEffects(builder, statusEffects)

	pos := Vec2fMarshalFlatbuf(builder, e.Position())
	BerryhunterApi.ResourceAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(e.AABB(), builder)
	BerryhunterApi.ResourceAddAabb(builder, aabb)

	BerryhunterApi.ResourceAddRadius(builder, f32ToU16Px(e.Radius()))
	BerryhunterApi.ResourceAddEntityType(builder, BerryhunterApi.EntityType(e.Type()))

	BerryhunterApi.ResourceAddCapacity(builder, byte(e.Resource().Capacity))
	BerryhunterApi.ResourceAddStock(builder, byte(e.Resource().Available))

	return BerryhunterApi.ResourceEnd(builder)
}

func PlaceableEntityFlatbufMarshal(e model.PlaceableEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	statusEffects := StatusEffectsMarshal(builder, e)

	BerryhunterApi.PlaceableStart(builder)
	BerryhunterApi.PlaceableAddId(builder, e.Basic().ID())
	BerryhunterApi.PlaceableAddStatusEffects(builder, statusEffects)

	pos := Vec2fMarshalFlatbuf(builder, e.Position())
	BerryhunterApi.PlaceableAddPos(builder, pos)

	aabb := AabbMarshalFlatbuf(e.AABB(), builder)
	BerryhunterApi.PlaceableAddAabb(builder, aabb)

	BerryhunterApi.PlaceableAddRadius(builder, f32ToU16Px(e.Radius()))
	BerryhunterApi.PlaceableAddEntityType(builder, BerryhunterApi.EntityType(e.Type()))

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
