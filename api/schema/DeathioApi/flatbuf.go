package DeathioApi

import "github.com/google/flatbuffers/go"

type FlatbufMarshaller interface {
	MarshalFlatbuf(builder *flatbuffers.Builder) flatbuffers.UOffsetT
}
