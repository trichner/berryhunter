package sys

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/minions"
	"github.com/trichner/berryhunter/backend/model"
)

type PreUpdateSystem struct {
	preUpdaters []model.PreUpdater
}

func NewPreUpdateSystem() *PreUpdateSystem {
	return &PreUpdateSystem{}
}

func (*PreUpdateSystem) Priority() int {
	return -30
}

func (p *PreUpdateSystem) AddPreUpdater(u model.PreUpdater) {
	p.preUpdaters = append(p.preUpdaters, u)
}

func (p *PreUpdateSystem) Update(dt float32) {
	for _, u := range p.preUpdaters {
		u.PreUpdate(dt)
	}
}

func (p *PreUpdateSystem) Remove(e ecs.BasicEntity) {
	delete := minions.FindBasic(func(i int) model.BasicEntity { return p.preUpdaters[i] }, len(p.preUpdaters), e)
	if delete >= 0 {
		//e := p.players[delete]
		p.preUpdaters = append(p.preUpdaters[:delete], p.preUpdaters[delete+1:]...)
	}
}
