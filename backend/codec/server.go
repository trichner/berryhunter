package codec

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/phy"
)

func ServerMessageWrapFlatbufMarshal(builder *flatbuffers.Builder, body flatbuffers.UOffsetT, bodyType byte) flatbuffers.UOffsetT {
	BerryhunterApi.ServerMessageStart(builder)
	BerryhunterApi.ServerMessageAddBodyType(builder, bodyType)
	BerryhunterApi.ServerMessageAddBody(builder, body)
	return BerryhunterApi.ServerMessageEnd(builder)
}

func WelcomeMessageFlatbufMarshal(builder *flatbuffers.Builder, w *Welcome) flatbuffers.UOffsetT {
	serverName := builder.CreateString(w.ServerName)

	BerryhunterApi.WelcomeStart(builder)
	BerryhunterApi.WelcomeAddServerName(builder, serverName)
	sidePx := intToF32Px(w.MapSize)
	size := Vec2fMarshalFlatbuf(builder, phy.Vec2f{sidePx, sidePx})
	BerryhunterApi.WelcomeAddMapSize(builder, size)

	welcome := BerryhunterApi.WelcomeEnd(builder)

	return ServerMessageWrapFlatbufMarshal(builder, welcome, BerryhunterApi.ServerMessageBodyWelcome)
}

type Welcome struct {
	ServerName string
	MapSize    int
}