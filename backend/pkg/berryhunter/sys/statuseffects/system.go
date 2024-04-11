package statuseffects

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/minions"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
)

type entity struct {
	b model.BasicEntity
	s model.StatusEntity
}

type StatusEffectsSystem struct {
	entities []entity
}

func NewStatusEffectsSystem() *StatusEffectsSystem {
	return &StatusEffectsSystem{}
}

func (*StatusEffectsSystem) Priority() int {
	return 101
}

func (p *StatusEffectsSystem) Add(b model.BasicEntity, s model.StatusEntity) {
	p.entities = append(p.entities, entity{b, s})
}

func (p *StatusEffectsSystem) Update(dt float32) {
	for _, e := range p.entities {
		e.s.StatusEffects().Clear()
	}
}

func (p *StatusEffectsSystem) Remove(e ecs.BasicEntity) {
	delete := minions.FindBasic(func(i int) model.BasicEntity { return p.entities[i].b }, len(p.entities), e)
	if delete >= 0 {
		//e := p.players[delete]
		p.entities = append(p.entities[:delete], p.entities[delete+1:]...)
	}
}
