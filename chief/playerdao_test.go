package main_test

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)
import "github.com/trichner/berryhunter/chief"

func TestNewPlayerDao(t *testing.T) {

	playerDao, err := main.NewPlayerDao()
	assert.NoError(t,err)

	p := main.Player{
		Name:"Jimmy Belair",
		Score:10,
	}

	playerDao.UpdatePlayer(p)

	players, err := playerDao.FindPlayers()
	for _, p := range players {
		fmt.Printf("Player: %v\n", p)
	}
}