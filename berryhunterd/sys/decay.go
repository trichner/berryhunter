package sys

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/berryhunterd/minions"
	"github.com/trichner/berryhunter/berryhunterd/model"
)

type DecaySystem struct {
	decayables []model.Decayer

	g model.Game
}

func NewDecaySystem(g model.Game) *DecaySystem {
	return &DecaySystem{g: g}
}

func (*DecaySystem) Priority() int {
	return -60
}

func (d *DecaySystem) AddDecayable(e model.Decayer) {
	d.decayables = append(d.decayables, e)
}

func (d *DecaySystem) Update(dt float32) {
	for _, e := range d.decayables {
		if e.Decayed() {
			d.g.RemoveEntity(e.Basic())
		}
	}
}

func (d *DecaySystem) Remove(e ecs.BasicEntity) {
	delete := minions.FindBasic(func(i int) model.BasicEntity { return d.decayables[i] }, len(d.decayables), e)
	if delete >= 0 {
		//e := p.players[delete]
		d.decayables = append(d.decayables[:delete], d.decayables[delete+1:]...)
	}
}
