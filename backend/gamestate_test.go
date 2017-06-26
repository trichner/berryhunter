package main

import (
	"testing"
	"encoding/json"
	"fmt"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/google/flatbuffers/go"
)

type AabbTest struct {
	//LowerX *float32 `json:"LowerX,omitempty"`
	//LowerY *float32 `json:"LowerY,omitempty"`
	UpperX *float32 `json:"UpperX,omitempty"`
	UpperY *float32 `json:"UpperY,omitempty"`
}

func TestMarshall_AabbDTO(t *testing.T) {

	aabb := &AabbTest{
		//LowerX: &(&floatwrapper{1}).f,
		//LowerY: &(&floatwrapper{2}).f,
		UpperX: &(&floatwrapper{6}).f,
		UpperY: &(&floatwrapper{4}).f,
	}
	bytes, err := json.Marshal(aabb)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Printf("%s", bytes)
}

func newTestInventory() inventory {
	return inventory{
		items: []*itemStack{
			{item: DeathioApi.ItemStoneTool, count: 1},
			{item: DeathioApi.ItemWoodClub, count: 5},
		},
		cap: 8,
	}
}

func newTestPlayer() *player {
	p := &player{}
	p.inventory = newTestInventory()
	p.entityType = DeathioApi.EntityTypeCharacter
	p.actionTick = 17
	return p
}

func TestGameState_MarshalFlatbuf(t *testing.T) {

	gs := &GameState{}
	gs.Player = newTestPlayer()
	gs.Tick = 1234
	builder := flatbuffers.NewBuilder(50)
	builder.Finish(gs.MarshalFlatbuf(builder))
	bytes := builder.FinishedBytes()

	DeathioApi.GetRootAsGameState(bytes, 0)
}