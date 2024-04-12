package codec

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
)

func EntityMessageFlatbufMarshal(builder *flatbuffers.Builder, id uint64, msg string) flatbuffers.UOffsetT {
	msgOffset := builder.CreateString(msg)
	BerryhunterApi.EntityMessageStart(builder)
	BerryhunterApi.EntityMessageAddEntityId(builder, id)
	BerryhunterApi.EntityMessageAddMessage(builder, msgOffset)
	entityMessage := BerryhunterApi.EntityMessageEnd(builder)

	return ServerMessageWrapFlatbufMarshal(builder, entityMessage, BerryhunterApi.ServerMessageBodyEntityMessage)
}
