package effects

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"github.com/trichner/berryhunter/berryhunterd/minions"
	"github.com/trichner/berryhunter/berryhunterd/model"
)

type effectEntity struct {
	b model.BasicEntity
	e effects.EffectEntity
}

type EffectSystem struct {
	entities       []effectEntity
	effectRegistry effects.Registry
}

func NewEffectSystem(r effects.Registry) *EffectSystem {
	return &EffectSystem{
		effectRegistry: r,
	}
}

func (es *EffectSystem) Priority() int {
	return 102
}

func (es *EffectSystem) Add(b model.BasicEntity, e effects.EffectEntity) {
	es.entities = append(es.entities, effectEntity{b, e})
}

func (es *EffectSystem) Update(dt float32) {
	for _, e := range es.entities {
		e.e.EffectStack().Update(dt, es.effectRegistry)
	}
}

func (es *EffectSystem) Remove(e ecs.BasicEntity) {
	del := minions.FindBasic(func(i int) model.BasicEntity { return es.entities[i].b }, len(es.entities), e)
	if del >= 0 {
		es.entities = append(es.entities[:del], es.entities[del+1:]...)
	}
}
