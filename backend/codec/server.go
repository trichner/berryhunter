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

func WelcomeMessageFlatbufMarshal(builder *flatbuffers.Builder, serverName string, mapSize float32) flatbuffers.UOffsetT {
	nameOffset := builder.CreateString(serverName)

	BerryhunterApi.WelcomeStart(builder)
	BerryhunterApi.WelcomeAddServerName(builder, nameOffset)

	size := Vec2fMarshalFlatbuf(builder, phy.Vec2f{mapSize, mapSize})
	BerryhunterApi.WelcomeAddMapSize(builder, size)

	welcomeMsg := BerryhunterApi.WelcomeEnd(builder)
	return ServerMessageWrapFlatbufMarshal(builder, welcomeMsg, BerryhunterApi.ServerMessageBodyWelcome)
}
