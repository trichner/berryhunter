package client

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/trichner/berryhunter/pkg/api/ChieftainApi"

	"github.com/google/flatbuffers/go"
)

func Test_playerMarshal(t *testing.T) {
	type player struct {
		uuid, name string
		score      uint64
	}

	players := []player{
		{
			name:  "Helge",
			uuid:  "1234",
			score: 4567,
		},
	}

	for _, player := range players {
		t.Run(" encoding "+player.name, func(t *testing.T) {
			builder := flatbuffers.NewBuilder(16)
			p := &Player{
				Uuid:  player.uuid,
				Name:  player.name,
				Score: player.score,
			}
			root := playerMarshal(builder, p)
			builder.Finish(root)

			buf := builder.FinishedBytes()

			decoded := ChieftainApi.GetRootAsScoreboardPlayer(buf, 0)
			assert.Equal(t, player.name, string(decoded.Name()))
			assert.Equal(t, player.uuid, string(decoded.Uuid()))
			assert.Equal(t, player.score, decoded.Score())
		})
	}
}
