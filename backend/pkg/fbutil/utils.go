package fbutil

import (
	"fmt"
	"github.com/google/flatbuffers/go"
)

type TableInitializer interface {
	Init(buf []byte, i flatbuffers.UOffsetT)
}

type Unioner[T ~byte] interface {
	BodyType() T
	Body(obj *flatbuffers.Table) bool
}

func UnwrapUnion[T ~byte](msg Unioner[T], b TableInitializer) error {

	unionTable := new(flatbuffers.Table)
	if msg.Body(unionTable) {
		b.Init(unionTable.Bytes, unionTable.Pos)
		return nil
	}

	return fmt.Errorf("cannot unwrap union")
}

func AssertBodyType[T ~byte](msg Unioner[T], expected T) error {

	bodyType := msg.BodyType()
	if bodyType != expected {
		return fmt.Errorf("illegal union type: %d", expected)
	}
	return nil
}
