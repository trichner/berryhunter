package fbutil

import (
	"fmt"
	"github.com/google/flatbuffers/go"
)

type TableInitializer interface {
	Init(buf []byte, i flatbuffers.UOffsetT)
}

type Unioner interface {
	BodyType() byte
	Body(obj *flatbuffers.Table) bool
}

func UnwrapUnion(msg Unioner, b TableInitializer) error {

	unionTable := new(flatbuffers.Table)
	if msg.Body(unionTable) {
		b.Init(unionTable.Bytes, unionTable.Pos)
		return nil
	}

	return fmt.Errorf("cannot unwrap union")
}

func AssertBodyType(msg Unioner, expected byte) error{

	bodyType := msg.BodyType()
	if bodyType != expected {
		return fmt.Errorf("illegal union type: %d", expected)
	}
	return nil
}
