package codec

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/model"
)

func ScoreboardFlatbufMarshal(builder *flatbuffers.Builder, scoreboard model.Scoreboard) flatbuffers.UOffsetT {

	n := len(scoreboard.Players)
	players := make([]flatbuffers.UOffsetT,0,n)
	for _, p := range scoreboard.Players {
		name := builder.CreateString(p.Name())
		BerryhunterApi.ScoreboardPlayerStart(builder)
		BerryhunterApi.ScoreboardPlayerAddName(builder, name)
		// TODO add score
		players=append(players, BerryhunterApi.ScoreboardPlayerEnd(builder))
	}

	BerryhunterApi.ScoreboardStartPlayersVector(builder, n)
	for _, p := range players {
		builder.PrependUOffsetT(p)
	}
	playersOffset := builder.EndVector(n)

	BerryhunterApi.ScoreboardStart(builder)
	BerryhunterApi.ScoreboardAddPlayers(builder, playersOffset)

	m := BerryhunterApi.ScoreboardEnd(builder)

	return ServerMessageWrapFlatbufMarshal(builder, m, BerryhunterApi.ServerMessageBodyScoreboard)
}