package codec

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/model"
)

func MobEntityFlatbufMarshal(m model.MobEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	statusEffects := StatusEffectsMarshal(builder, m)

	BerryhunterApi.MobStart(builder)
	BerryhunterApi.MobAddId(builder, m.Basic().ID())
	BerryhunterApi.MobAddStatusEffects(builder, statusEffects)
	BerryhunterApi.MobAddMobId(builder, uint16(m.MobID()))
	BerryhunterApi.MobAddEntityType(builder, uint16(m.Type()))
	BerryhunterApi.MobAddRotation(builder, m.Angle())

	aabb := AabbMarshalFlatbuf(m.AABB(), builder)
	BerryhunterApi.MobAddAabb(builder, aabb)

	pos := Vec2fMarshalFlatbuf(builder, m.Position())
	BerryhunterApi.MobAddPos(builder, pos)

	return BerryhunterApi.MobEnd(builder)
}
