// automatically generated by the FlatBuffers compiler, do not modify

package BerryhunterApi

import (
	flatbuffers "github.com/google/flatbuffers/go"
)

type EntityMessage struct {
	_tab flatbuffers.Table
}

func GetRootAsEntityMessage(buf []byte, offset flatbuffers.UOffsetT) *EntityMessage {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &EntityMessage{}
	x.Init(buf, n+offset)
	return x
}

func (rcv *EntityMessage) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *EntityMessage) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *EntityMessage) Id() uint64 {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.GetUint64(o + rcv._tab.Pos)
	}
	return 0
}

func (rcv *EntityMessage) MutateId(n uint64) bool {
	return rcv._tab.MutateUint64Slot(4, n)
}

func (rcv *EntityMessage) Message() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func EntityMessageStart(builder *flatbuffers.Builder) {
	builder.StartObject(2)
}
func EntityMessageAddId(builder *flatbuffers.Builder, id uint64) {
	builder.PrependUint64Slot(0, id, 0)
}
func EntityMessageAddMessage(builder *flatbuffers.Builder, message flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(1, flatbuffers.UOffsetT(message), 0)
}
func EntityMessageEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}