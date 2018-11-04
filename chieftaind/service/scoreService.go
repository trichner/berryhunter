package service

import (
	"context"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"time"
)

type ScoreService interface {
	ScoresPerPeriod(ctx context.Context, limit int) (*Scores, error)
}

type scoreService struct {
	playerDao dao.PlayerDao
}

func NewScoreService(pdao dao.PlayerDao) (ScoreService, error) {
	return &scoreService{pdao}, nil
}

func (s *scoreService) UpdateScores(ctx context.Context, scoreBoard ScoreBoard) (error) {
	for _, player := range scoreBoard.players {

		// Logic
		// 1. find entry with uuid
		p, err := s.playerDao.FindPlayerByUuid(ctx, string(player.Uuid))

		if err != nil {
			return err
		}

		// 2. player exists and already has a higher score in the db
		if p != nil && p.Score >= uint(player.Score) {
			// nothing to do here
			continue
		}

		// 3. store new score
		s.playerDao.UpsertPlayer(ctx, dao.Player{
			Uuid:    string(player.Uuid),
			Name:    string(player.Name),
			Score:   uint(player.Score),
			Updated: time.Now().Unix(),
		})
	}
	return nil
}

func (s *scoreService) ScoresPerPeriod(ctx context.Context, limit int) (*Scores, error) {
	scores := &Scores{}

	p, err := s.playerDao.FindTopPlayersInPeriod(ctx, limit, dao.OneDay)
	if err != nil {
		return scores, err
	}
	scores.Daily = p

	p, err = s.playerDao.FindTopPlayersInPeriod(ctx, limit, dao.OneWeek)
	if err != nil {
		return scores, err
	}
	scores.Weekly = p

	p, err = s.playerDao.FindTopPlayersInPeriod(ctx, limit, dao.OneMonth)
	if err != nil {
		return scores, err
	}
	scores.Monthly = p

	p, err = s.playerDao.FindTopPlayers(ctx, limit)
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

type ScoreBoard struct {
	players   []dao.Player `json:"players"`
}
