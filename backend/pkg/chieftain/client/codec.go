package client

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/pkg/api/ChieftainApi"
)

type Player struct {
	Uuid  string
	Name  string
	Score uint64
}

type Scoreboard struct {
	Players []Player
}

func clientMessageWrapFlatbufMarshal(builder *flatbuffers.Builder, body flatbuffers.UOffsetT, bodyType ChieftainApi.ClientMessageBody) flatbuffers.UOffsetT {
	ChieftainApi.ClientMessageStart(builder)
	ChieftainApi.ClientMessageAddBodyType(builder, bodyType)
	ChieftainApi.ClientMessageAddBody(builder, body)
	return ChieftainApi.ClientMessageEnd(builder)
}

func playerMarshal(builder *flatbuffers.Builder, p *Player) flatbuffers.UOffsetT {
	uuid := builder.CreateString(p.Uuid)
	name := builder.CreateString(p.Name)

	ChieftainApi.ScoreboardPlayerStart(builder)
	ChieftainApi.ScoreboardPlayerAddUuid(builder, uuid)
	ChieftainApi.ScoreboardPlayerAddName(builder, name)
	ChieftainApi.ScoreboardPlayerAddScore(builder, p.Score)
	return ChieftainApi.ScoreboardPlayerEnd(builder)
}

func ScoreBoardMarshal(w *Scoreboard) []byte {
	builder := flatbuffers.NewBuilder(64)

	nplayers := len(w.Players)
	playerOffsets := make([]flatbuffers.UOffsetT, 0, nplayers)
	for _, p := range w.Players {
		playerOffsets = append(playerOffsets, playerMarshal(builder, &p))
	}

	ChieftainApi.ScoreboardStartPlayersVector(builder, nplayers)
	for _, p := range playerOffsets {
		builder.PrependUOffsetT(p)
	}
	players := builder.EndVector(nplayers)

	ChieftainApi.ScoreboardStart(builder)
	ChieftainApi.ScoreboardAddPlayers(builder, players)
	scoreboard := ChieftainApi.ScoreboardEnd(builder)

	msg := clientMessageWrapFlatbufMarshal(builder, scoreboard, ChieftainApi.ClientMessageBodyScoreboard)
	builder.Finish(msg)

	return builder.FinishedBytes()
}
