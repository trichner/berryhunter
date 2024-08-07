// Code generated by the FlatBuffers compiler. DO NOT EDIT.

package ChieftainApi

import (
	flatbuffers "github.com/google/flatbuffers/go"
)

type ScoreboardPlayer struct {
	_tab flatbuffers.Table
}

func GetRootAsScoreboardPlayer(buf []byte, offset flatbuffers.UOffsetT) *ScoreboardPlayer {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &ScoreboardPlayer{}
	x.Init(buf, n+offset)
	return x
}

func FinishScoreboardPlayerBuffer(builder *flatbuffers.Builder, offset flatbuffers.UOffsetT) {
	builder.Finish(offset)
}

func GetSizePrefixedRootAsScoreboardPlayer(buf []byte, offset flatbuffers.UOffsetT) *ScoreboardPlayer {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &ScoreboardPlayer{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func FinishSizePrefixedScoreboardPlayerBuffer(builder *flatbuffers.Builder, offset flatbuffers.UOffsetT) {
	builder.FinishSizePrefixed(offset)
}

func (rcv *ScoreboardPlayer) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *ScoreboardPlayer) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *ScoreboardPlayer) Uuid() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func (rcv *ScoreboardPlayer) Name() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func (rcv *ScoreboardPlayer) Score() uint64 {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		return rcv._tab.GetUint64(o + rcv._tab.Pos)
	}
	return 0
}

func (rcv *ScoreboardPlayer) MutateScore(n uint64) bool {
	return rcv._tab.MutateUint64Slot(8, n)
}

func ScoreboardPlayerStart(builder *flatbuffers.Builder) {
	builder.StartObject(3)
}
func ScoreboardPlayerAddUuid(builder *flatbuffers.Builder, uuid flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(0, flatbuffers.UOffsetT(uuid), 0)
}
func ScoreboardPlayerAddName(builder *flatbuffers.Builder, name flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(1, flatbuffers.UOffsetT(name), 0)
}
func ScoreboardPlayerAddScore(builder *flatbuffers.Builder, score uint64) {
	builder.PrependUint64Slot(2, score, 0)
}
func ScoreboardPlayerEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}
