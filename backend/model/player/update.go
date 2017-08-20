package player

func (p *player) Update(dt float32) {
	// update time based tings

	vitalSigns := p.VitalSigns()

	// heat
	t := vitalSigns.BodyTemperature
	temperatureFraction := float32(0.0008)
	vitalSigns.BodyTemperature = t.SubFraction(temperatureFraction)

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
