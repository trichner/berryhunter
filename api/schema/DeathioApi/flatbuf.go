package DeathioApi

import "github.com/google/flatbuffers/go"

type FlatbufCodec interface {
	FlatbufMarshaller
	FlatbufUnmarshaller
}

type FlatbufMarshaller interface {
	MarshalFlatbuf(builder *flatbuffers.Builder) flatbuffers.UOffsetT
}

type FlatbufUnmarshaller interface {
	UnmarshalFlatbuf(bytes []byte, offset flatbuffers.UOffsetT)
}