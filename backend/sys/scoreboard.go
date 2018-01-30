package sys

import (
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/minions"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/google/flatbuffers/go"
	"log"
)

type ScoreboardSystem struct {
	players []model.PlayerEntity
	g                model.Game
}

func NewScoreboardSystem(g model.Game) *ScoreboardSystem {

	return &ScoreboardSystem{g: g}
}

func (*ScoreboardSystem) Priority() int {
	return -101
}

func (d *ScoreboardSystem) AddPlayer(e model.PlayerEntity) {
	d.players = append(d.players, e)
}

func (d *ScoreboardSystem) Update(dt float32) {

	// only send every 10s
	if d.g.Ticks() % 300 != 0 {
		return
	}

	scoreboard := model.Scoreboard{
		Players:d.players,
	}
	builder := flatbuffers.NewBuilder(32)
	msg := codec.ScoreboardFlatbufMarshal(builder, scoreboard)
	builder.Finish(msg)

	for _, p := range d.players {
		log.Printf("Sending scoreboard to: " + p.Name())
		p.Client().SendMessage(builder.FinishedBytes())
	}
}

func (d *ScoreboardSystem) Remove(e ecs.BasicEntity) {
	idx := minions.FindBasic(func(i int) model.BasicEntity { return d.players[i] }, len(d.players), e)
	if idx >= 0 {
		//e := p.players[idx]
		d.players = append(d.players[:idx], d.players[idx+1:]...)
	}
}
