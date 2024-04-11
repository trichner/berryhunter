package codec

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
)

func ScoreboardFlatbufMarshal(builder *flatbuffers.Builder, scoreboard model.Scoreboard) flatbuffers.UOffsetT {

	tick := scoreboard.Tick

	n := len(scoreboard.Players)
	players := make([]flatbuffers.UOffsetT, 0, n)
	for _, p := range scoreboard.Players {
		name := builder.CreateString(p.Name())
		BerryhunterApi.ScoreboardPlayerStart(builder)
		BerryhunterApi.ScoreboardPlayerAddName(builder, name)

		score := tick - p.Stats().BirthTick
		BerryhunterApi.ScoreboardPlayerAddScore(builder, score)

		players = append(players, BerryhunterApi.ScoreboardPlayerEnd(builder))
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
