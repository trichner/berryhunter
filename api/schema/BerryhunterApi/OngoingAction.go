// automatically generated by the FlatBuffers compiler, do not modify

package BerryhunterApi

import (
	flatbuffers "github.com/google/flatbuffers/go"
)

type OngoingAction struct {
	_tab flatbuffers.Struct
}

func (rcv *OngoingAction) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *OngoingAction) Table() flatbuffers.Table {
	return rcv._tab.Table
}

func (rcv *OngoingAction) TicksRemaining() uint16 {
	return rcv._tab.GetUint16(rcv._tab.Pos + flatbuffers.UOffsetT(0))
}
func (rcv *OngoingAction) MutateTicksRemaining(n uint16) bool {
	return rcv._tab.MutateUint16(rcv._tab.Pos+flatbuffers.UOffsetT(0), n)
}

func (rcv *OngoingAction) ActionType() byte {
	return rcv._tab.GetByte(rcv._tab.Pos + flatbuffers.UOffsetT(2))
}
func (rcv *OngoingAction) MutateActionType(n byte) bool {
	return rcv._tab.MutateByte(rcv._tab.Pos+flatbuffers.UOffsetT(2), n)
}

func CreateOngoingAction(builder *flatbuffers.Builder, ticksRemaining uint16, actionType byte) flatbuffers.UOffsetT {
	builder.Prep(2, 4)
	builder.Pad(1)
	builder.PrependByte(actionType)
	builder.PrependUint16(ticksRemaining)
	return builder.Offset()
}