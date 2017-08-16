package codec

import (
	"github.com/trichner/berryhunter/backend/model"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
)

func MobEntityFlatbufMarshal(m model.MobEntity, builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	BerryhunterApi.MobStart(builder)
	BerryhunterApi.MobAddId(builder, m.Basic().ID())
	BerryhunterApi.MobAddMobId(builder, uint16(m.MobID()))
	BerryhunterApi.MobAddEntityType(builder, uint16(m.Type()))
	BerryhunterApi.MobAddRotation(builder, m.Angle())

	aabb := AabbMarshalFlatbuf(m.AABB(), builder)
	BerryhunterApi.MobAddAabb(builder, aabb)

	pos := Vec2fMarshalFlatbuf(builder, m.Position())
	BerryhunterApi.MobAddPos(builder, pos)

	return BerryhunterApi.MobEnd(builder)
}
