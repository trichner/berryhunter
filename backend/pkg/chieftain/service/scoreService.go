package service

import (
	"context"
	"github.com/trichner/berryhunter/pkg/chieftain/dao"
)

type ScoreService interface {
	ScoresPerPeriod(ctx context.Context, limit int) (*Scores, error)
}

type scoreService struct {
	pdao dao.PlayerDao
}

func NewScoreService(pdao dao.PlayerDao) (ScoreService, error) {
	return &scoreService{pdao}, nil
}

func (s *scoreService) ScoresPerPeriod(ctx context.Context, limit int) (*Scores, error) {
	scores := &Scores{}

	p, err := s.pdao.FindTopPlayersInPeriod(ctx, limit, dao.OneDay)
	if err != nil {
		return scores, err
	}
	scores.Daily = p

	p, err = s.pdao.FindTopPlayersInPeriod(ctx, limit, dao.OneWeek)
	if err != nil {
		return scores, err
	}
	scores.Weekly = p

	p, err = s.pdao.FindTopPlayersInPeriod(ctx, limit, dao.OneMonth)
	if err != nil {
		return scores, err
	}
	scores.Monthly = p

	p, err = s.pdao.FindTopPlayers(ctx, limit)
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
