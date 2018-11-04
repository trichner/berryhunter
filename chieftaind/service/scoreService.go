package service

import (
	"context"
	"github.com/trichner/berryhunter/chieftaind/dao"
)

func GetScoresPerPeriod(ctx context.Context, pdao dao.PlayerDao, limit int) (Scores, error) {
	scores := Scores{}

	p, err := pdao.FindTopPlayersInPeriod(ctx, limit, "24 hours")
	if err != nil {
		return scores, err
	}
	scores.Daily = p

	p, err = pdao.FindTopPlayersInPeriod(ctx, limit, "7 days")
	if err != nil {
		return scores, err
	}
	scores.Weekly = p

	p, err = pdao.FindTopPlayersInPeriod(ctx, limit, "30 days")
	if err != nil {
		return scores, err
	}
	scores.Monthly = p

	p, err = pdao.FindTopPlayers(ctx, limit)
	if err != nil {
		return scores, err
	}
	scores.Alltime = p

	return scores, nil
}

type Scores struct {
	Daily   []dao.Player `json:"daily"`
	Weekly  []dao.Player `json:"weekly"`
	Monthly []dao.Player `json:"monthly"`
	Alltime []dao.Player `json:"alltime"`
}
