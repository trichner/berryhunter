package player

func (p *player) Update(dt float32) {
	// update time based tings

	// action
	if p.ongoingAction != nil {
		done := p.ongoingAction.Update(dt)
		if done {
			p.ongoingAction = nil
		}
	}

	vitalSigns := p.VitalSigns()

	// are we freezing?
	if vitalSigns.BodyTemperature <= 0 {
		h := vitalSigns.Health
		healthFraction := float32(0.001)
		h = h.SubFraction(healthFraction)
		vitalSigns.Health = h
	}

	// satiety
	s := vitalSigns.Satiety
	satietyFraction := float32(0.0002)
	vitalSigns.Satiety = s.SubFraction(satietyFraction)

	// heal if satiety is high enough
	if vitalSigns.Satiety.Fraction() > 0.6 {
		h := vitalSigns.Health
		healthFraction := float32(0.0006)
		h = h.AddFraction(healthFraction)
		vitalSigns.Health = h

		s := vitalSigns.Satiety
		satietyFraction := float32(0.0004)
		vitalSigns.Satiety = s.SubFraction(satietyFraction)
	}

}
