package dao

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewPlayerDao(t *testing.T) {
	p1 := Player{
		Uuid:    "df8299c1-eb30-462d-9a86-ec7f8d2bca82",
		Name:    "Jimmy Belair",
		Score:   10,
		Updated: ConvertTime(time.Now()),
	}

	p2 := Player{
		Uuid:    "06cb0e74-7ab9-407b-9bf0-a138335b807a",
		Name:    "Bob Eiger",
		Score:   11,
		Updated: ConvertTime(time.Now()),
	}

	ds, err := NewDataStore()
	assert.NoError(t, err)

	err = ds.Transact(context.Background(), func(ctx context.Context) error {
		playerDao, err := NewPlayerDao()
		assert.NoError(t, err)

		playerDao.UpsertPlayer(ctx, p1)

		playerDao.UpsertPlayer(ctx, p2)

		p2.Score = p2.Score + 1
		playerDao.UpsertPlayer(ctx, p2)

		players, err := playerDao.FindPlayers(ctx)
		for _, p := range players {
			fmt.Printf("Player: %v\n", p)
		}
		return err
	})
	assert.NoError(t, err)
}
