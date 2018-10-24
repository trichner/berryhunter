package player

import (
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/berryhunterd/model/vitals"
)

func (p *player) Update(dt float32) {
	// update time based tings


	// action
	if p.ongoingAction != nil {
		a := p.ongoingAction
		a.Update(dt)
		if a.TicksRemaining() < 0 {
			p.ongoingAction = nil
		}
	}

	if !p.isGod {
		p.updateVitalSigns(dt)
	}
}

func (p *player) updateVitalSigns(dt float32) {

	vitalSigns := p.VitalSigns()

	c := p.config

	// are we freezing?
	if vitalSigns.BodyTemperature <= 0 {
		healthFraction := c.FreezingDamageTickFraction
		p.addHealthFraction(-healthFraction)
		p.statusEffects.Add(model.StatusEffectFreezing)
	}

	// satiety
	s := vitalSigns.Satiety
	satietyFraction := c.SatietyLossTickFraction
	vitalSigns.Satiety = s.SubFraction(satietyFraction)

	// heal if satiety and temperature are high enough
	if vitalSigns.Satiety.Fraction() > c.HealthGainSatietyThreshold && vitalSigns.BodyTemperature.Fraction() > c.HealthGainTemperatureThreshold {

		if vitalSigns.Health != vitals.Max {

			healthFraction := c.HealthGainTick
			p.addHealthFraction(healthFraction)

			p.statusEffects.Add(model.StatusEffectRegenerating)

			s := vitalSigns.Satiety
			satietyFraction := c.HealthGainSatietyLossTickFraction
			vitalSigns.Satiety = s.SubFraction(satietyFraction)
		}

	} else if vitalSigns.Satiety.Fraction() <= 0 {
		// are we starving?
		healthFraction := c.StarveDamageTickFraction
		p.addHealthFraction(-healthFraction)
		p.statusEffects.Add(model.StatusEffectStarving)
	}
}

func (p *player) addHealthFraction(fraction float32) {
	h := p.VitalSigns().Health
	h = h.AddFraction(fraction)
	p.VitalSigns().Health = h
}

