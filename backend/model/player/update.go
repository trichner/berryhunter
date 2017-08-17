package player

import "log"

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

	//TODO Hack
	join := p.Client().NextJoin()
	if join != nil {
		p.name = join.PlayerName
		log.Printf("Join message: %s", join.PlayerName)
	}

	if p.VitalSigns().Health == 0 {
		// kill player
	}
}
