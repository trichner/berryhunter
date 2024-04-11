package model

import "github.com/trichner/berryhunter/pkg/api/BerryhunterApi"

const (
	StatusEffectDamaged        = StatusEffect(BerryhunterApi.StatusEffectDamaged)
	StatusEffectYielded        = StatusEffect(BerryhunterApi.StatusEffectYielded)
	StatusEffectFreezing       = StatusEffect(BerryhunterApi.StatusEffectFreezing)
	StatusEffectStarving       = StatusEffect(BerryhunterApi.StatusEffectStarving)
	StatusEffectRegenerating   = StatusEffect(BerryhunterApi.StatusEffectRegenerating)
	StatusEffectDamagedAmbient = StatusEffect(BerryhunterApi.StatusEffectDamagedAmbient)
)

type StatusEffect int
type StatusEffects struct {
	effects map[StatusEffect]struct{}
}

func NewStatusEffects() StatusEffects {
	return StatusEffects{
		effects: make(map[StatusEffect]struct{}),
	}
}

func (s *StatusEffects) Clear() {
	s.effects = make(map[StatusEffect]struct{})
}

func (s *StatusEffects) Add(e StatusEffect) {
	s.effects[e] = struct{}{}
}

func (s *StatusEffects) Remove(e StatusEffect) {
	delete(s.effects, e)
}

func (s *StatusEffects) Effects() []StatusEffect {
	e := make([]StatusEffect, 0, len(s.effects))
	for k := range s.effects {
		e = append(e, k)
	}
	return e
}

type StatusEntity interface {
	StatusEffects() *StatusEffects
}
