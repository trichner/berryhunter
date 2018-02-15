package player

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

	// are we freezing?
	if vitalSigns.BodyTemperature <= 0 {
		healthFraction := float32(0.001)
		p.addHealthFraction(-healthFraction)
	}

	// satiety
	s := vitalSigns.Satiety
	satietyFraction := float32(0.0002)
	vitalSigns.Satiety = s.SubFraction(satietyFraction)

	// heal if satiety and temperature are high enough
	if vitalSigns.Satiety.Fraction() > 0.6 && vitalSigns.BodyTemperature.Fraction() > 0.2 {
		healthFraction := float32(0.0006)
		p.addHealthFraction(healthFraction)

		s := vitalSigns.Satiety
		satietyFraction := float32(0.0004)
		vitalSigns.Satiety = s.SubFraction(satietyFraction)
	} else if vitalSigns.Satiety.Fraction() <= 0 {
		// are we starving?
		healthFraction := float32(0.001)
		p.addHealthFraction(-healthFraction)
	}
}

func (p *player) addHealthFraction(fraction float32) {
	h := p.VitalSigns().Health
	h = h.AddFraction(fraction)
	p.VitalSigns().Health = h
}
