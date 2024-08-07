package dao

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/trichner/berryhunter/pkg/chieftain/db"

	"github.com/alecthomas/assert/v2"
)

func TestNewPlayerDao(t *testing.T) {
	p1 := Player{
		Uuid:    "df8299c1-eb30-462d-9a86-ec7f8d2bca82",
		Name:    "Jimmy Belair",
		Score:   10,
		Updated: time.Now().Unix(),
	}

	p2 := Player{
		Uuid:    "06cb0e74-7ab9-407b-9bf0-a138335b807a",
		Name:    "Bob Eiger",
		Score:   11,
		Updated: time.Now().Unix(),
	}

	database, err := db.New(t.TempDir() + "/test.db")
	assert.NoError(t, err)

	err = database.Transact(context.Background(), func(ctx context.Context) error {
		playerDao, err := NewPlayerDao(database)
		assert.NoError(t, err)

		err = playerDao.UpsertPlayer(ctx, p1)
		assert.NoError(t, err)

		err = playerDao.UpsertPlayer(ctx, p2)
		assert.NoError(t, err)

		p2.Score = p2.Score + 1
		err = playerDao.UpsertPlayer(ctx, p2)
		assert.NoError(t, err)

		players, err := playerDao.FindPlayers(ctx)
		assert.Equal(t, 2, len(players))
		for _, p := range players {
			fmt.Printf("Player: %v\n", p)
		}
		return err
	})
	assert.NoError(t, err)
}
