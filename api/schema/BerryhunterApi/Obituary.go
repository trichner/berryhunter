// automatically generated by the FlatBuffers compiler, do not modify

package BerryhunterApi

import (
	flatbuffers "github.com/google/flatbuffers/go"
)

type Obituary struct {
	_tab flatbuffers.Table
}

func GetRootAsObituary(buf []byte, offset flatbuffers.UOffsetT) *Obituary {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &Obituary{}
	x.Init(buf, n+offset)
	return x
}

func (rcv *Obituary) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *Obituary) Table() flatbuffers.Table {
	return rcv._tab
}

func ObituaryStart(builder *flatbuffers.Builder) {
	builder.StartObject(0)
}
func ObituaryEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}