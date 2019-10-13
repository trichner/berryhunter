package effects

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"github.com/trichner/berryhunter/berryhunterd/minions"
	"github.com/trichner/berryhunter/berryhunterd/model"
)

type effectEntity struct {
	b *model.BasicEntity
	//e *effects.EffectComponent
	e *effects.EffectStack
}

type EffectSystem struct {
	entities []effectEntity
}

func NewEffectSystem() *EffectSystem {
	return &EffectSystem{}
}

func (*EffectSystem) Priority() int {
	return 102
}

//func (p *EffectSystem) Add(b model.BasicEntity, e *effects.EffectComponent) {
//	p.entities = append(p.entities, effectEntity{b, e})
//}

func (p *EffectSystem) Add(b model.BasicEntity, e *effects.EffectStack) {
	p.entities = append(p.entities, effectEntity{&b, e})
}

func (p *EffectSystem) Update(dt float32) {
	//for _, e := range p.entities {
		// TODO reduce duration and remove timed out effects
	//}
}

func (p *EffectSystem) Remove(e ecs.BasicEntity) {
	delete := minions.FindBasic(func(i int) model.BasicEntity { return *p.entities[i].b }, len(p.entities), e)
	if delete >= 0 {
		p.entities = append(p.entities[:delete], p.entities[delete+1:]...)
	}
}
