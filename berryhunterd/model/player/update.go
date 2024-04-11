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
	ef := p.effectStack.Factors()

	// satiety
	s := vitalSigns.Satiety
	satietyFraction := c.SatietyLossTickFraction
	satietyFraction *= ef.SatietyLossTickFraction
	vitalSigns.Satiety = s.SubFraction(satietyFraction)

	// Are we both starving and freezing?
	if vitalSigns.BodyTemperature <= 0 && vitalSigns.Satiety.Fraction() <= 0 {
		healthFraction := -c.FreezingStarveDamageTickFraction
		healthFraction *= ef.FreezingStarveDamageTickFraction
		p.addHealthFraction(healthFraction)
		return
	}

	// are we freezing?
	if vitalSigns.BodyTemperature <= 0 {
		healthFraction := c.FreezingDamageTickFraction
		healthFraction *= ef.FreezingDamageTickFraction
		p.addHealthFraction(-healthFraction)
		p.statusEffects.Add(model.StatusEffectFreezing)
		return
	}

	// heal if satiety and temperature are high enough
	satietyThreshold := c.HealthGainSatietyThreshold
	satietyThreshold *= ef.HealthGainSatietyThreshold
	TemperatureThreshold := c.HealthGainTemperatureThreshold
	TemperatureThreshold *= ef.HealthGainTemperatureThreshold
	if vitalSigns.Satiety.Fraction() > satietyThreshold &&
		vitalSigns.BodyTemperature.Fraction() > TemperatureThreshold {

		if vitalSigns.Health != vitals.Max {
			healthFraction := c.HealthGainTick
			healthFraction *= ef.HealthGainTick
			p.addHealthFraction(healthFraction)

			p.statusEffects.Add(model.StatusEffectRegenerating)

			s := vitalSigns.Satiety
			satietyFraction := c.HealthGainSatietyLossTickFraction
			satietyFraction *= ef.HealthGainSatietyLossTickFraction
			vitalSigns.Satiety = s.SubFraction(satietyFraction)
		}

	} else if vitalSigns.Satiety.Fraction() <= 0 {
		// are we starving?
		healthFraction := c.StarveDamageTickFraction
		healthFraction *= ef.StarveDamageTickFraction
		p.addHealthFraction(-healthFraction)
		p.statusEffects.Add(model.StatusEffectStarving)
	}
}

func (p *player) addHealthFraction(fraction float32) {
	h := p.VitalSigns().Health
	h = h.AddFraction(fraction)
	p.VitalSigns().Health = h
}

