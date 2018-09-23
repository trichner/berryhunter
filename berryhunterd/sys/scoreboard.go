package sys

import (
	"engo.io/ecs"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/berryhunterd/codec"
	"github.com/trichner/berryhunter/berryhunterd/minions"
	"github.com/trichner/berryhunter/berryhunterd/model"
)

type ScoreboardSystem struct {
	players []model.PlayerEntity
	clients []model.ClientEntity
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
	d.clients = append(d.clients, e)
}

func (d *ScoreboardSystem) AddSpectator(e model.Spectator) {
	d.clients = append(d.clients, e)
}

func (d *ScoreboardSystem) Update(dt float32) {

	// only send every 10s
	if d.g.Ticks() % 300 != 0 {
		return
	}

	scoreboard := model.Scoreboard{
		Players:d.players,
		Tick:d.g.Ticks(),
	}
	builder := flatbuffers.NewBuilder(32)
	msg := codec.ScoreboardFlatbufMarshal(builder, scoreboard)
	builder.Finish(msg)

	for _, c := range d.clients {
		c.Client().SendMessage(builder.FinishedBytes())
	}
}

func (d *ScoreboardSystem) Remove(e ecs.BasicEntity) {
	idx := minions.FindBasic(func(i int) model.BasicEntity { return d.players[i] }, len(d.players), e)
	if idx >= 0 {
		//e := p.players[idx]
		d.players = append(d.players[:idx], d.players[idx+1:]...)
	}

	idx = minions.FindBasic(func(i int) model.BasicEntity { return d.clients[i] }, len(d.clients), e)
	if idx >= 0 {
		//e := p.players[idx]
		d.clients = append(d.clients[:idx], d.clients[idx+1:]...)
	}
}
