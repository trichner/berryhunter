package codec

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
)

func ServerMessageWrapFlatbufMarshal(builder *flatbuffers.Builder, body flatbuffers.UOffsetT, bodyType BerryhunterApi.ServerMessageBody) flatbuffers.UOffsetT {
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

func PongMessageFlatbufMarshal(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	BerryhunterApi.PongStart(builder)
	validToken := BerryhunterApi.PongEnd(builder)

	return ServerMessageWrapFlatbufMarshal(builder, validToken, BerryhunterApi.ServerMessageBodyPong)
}
