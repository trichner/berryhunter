package codec

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
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
	BerryhunterApi.WelcomeAddMapRadius(builder, w.Radius)

	welcome := BerryhunterApi.WelcomeEnd(builder)

	return ServerMessageWrapFlatbufMarshal(builder, welcome, BerryhunterApi.ServerMessageBodyWelcome)
}

type Welcome struct {
	ServerName string
	Radius     float32
}

func AcceptMessageFlatbufMarshal(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	BerryhunterApi.AcceptStart(builder)
	accept := BerryhunterApi.AcceptEnd(builder)

	return ServerMessageWrapFlatbufMarshal(builder, accept, BerryhunterApi.ServerMessageBodyAccept)
}

func ObituaryMessageFlatbufMarshal(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	BerryhunterApi.ObituaryStart(builder)
	accept := BerryhunterApi.ObituaryEnd(builder)

	return ServerMessageWrapFlatbufMarshal(builder, accept, BerryhunterApi.ServerMessageBodyObituary)
}

func ValidTokenMessageFlatbufMarshal(builder *flatbuffers.Builder) flatbuffers.UOffsetT {

	BerryhunterApi.ValidTokenStart(builder)
	validToken := BerryhunterApi.ValidTokenEnd(builder)

	return ServerMessageWrapFlatbufMarshal(builder, validToken, BerryhunterApi.ServerMessageBodyValidToken)
}