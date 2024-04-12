package sys

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/minions"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
)

type PostUpdateSystem struct {
	postUpdaters []model.PostUpdater
}

func NewPostUpdateSystem() *PostUpdateSystem {
	return &PostUpdateSystem{}
}

func (*PostUpdateSystem) Priority() int {
	return -80
}

func (p *PostUpdateSystem) AddPostUpdater(u model.PostUpdater) {
	p.postUpdaters = append(p.postUpdaters, u)
}

func (p *PostUpdateSystem) Update(dt float32) {
	for _, u := range p.postUpdaters {
		u.PostUpdate(dt)
	}
}

func (p *PostUpdateSystem) Remove(e ecs.BasicEntity) {
	delete := minions.FindBasic(func(i int) model.BasicEntity { return p.postUpdaters[i] }, len(p.postUpdaters), e)
	if delete >= 0 {
		// e := p.players[delete]
		p.postUpdaters = append(p.postUpdaters[:delete], p.postUpdaters[delete+1:]...)
	}
}
