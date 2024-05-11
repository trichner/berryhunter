package sys

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/berryhunterd/minions"
	"github.com/trichner/berryhunter/berryhunterd/model"
)

type UpdateSystem struct {
	updateables []model.Updater
}

func NewUpdateSystem() *UpdateSystem {
	return &UpdateSystem{}
}

func (*UpdateSystem) Priority() int {
	return -50
}

func (p *UpdateSystem) AddUpdateable(u model.Updater) {
	p.updateables = append(p.updateables, u)
}

func (p *UpdateSystem) Update(dt float32) {
	for _, u := range p.updateables {
		u.Update(dt)
	}
}

func (p *UpdateSystem) Remove(e ecs.BasicEntity) {
	delete := minions.FindBasic(func(i int) model.BasicEntity { return p.updateables[i] }, len(p.updateables), e)
	if delete >= 0 {
		//e := p.players[delete]
		p.updateables = append(p.updateables[:delete], p.updateables[delete+1:]...)
	}
}
