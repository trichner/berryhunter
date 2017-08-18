package player

func (p *player) Update(dt float32) {
	// update time based tings

	// heat
	t := p.VitalSigns().BodyTemperature
	temperatureFraction := float32(0.0008)
	p.VitalSigns().BodyTemperature = t.SubFraction(temperatureFraction)

	// satiety
	s := p.VitalSigns().Satiety
	satietyFraction := float32(0.0006)
	p.VitalSigns().Satiety = s.SubFraction(satietyFraction)
}
