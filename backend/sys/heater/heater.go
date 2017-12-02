package heater

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/model"
	"log"
	"github.com/trichner/berryhunter/backend/minions"
	"github.com/trichner/berryhunter/backend/model/vitals"
)

type playerMap map[ecs.BasicEntity]*temperatureEntity

type temperatureEntity struct {
	player      model.PlayerEntity
	temperature uint32
}

type HeaterSystem struct {
	heaters         []model.Heater
	players         playerMap
	baseTemperature uint32
}

func New() *HeaterSystem {
	return &HeaterSystem{
		players: make(playerMap),
	}
}

func (*HeaterSystem) Priority() int {
	return -10
}

func (h *HeaterSystem) New(w *ecs.World) {

	log.Println("HeaterSystem nominal")
	//FIXME HARDCODED
	h.baseTemperature = vitals.FractionToAbsPerTick(0.04)
}

func (f *HeaterSystem) AddPlayer(p model.PlayerEntity) {
	f.players[p.Basic()] = &temperatureEntity{player: p}
}

func (f *HeaterSystem) AddHeater(h model.Heater) {
	radiator := h.HeatRadiation()
	if radiator == nil {
		return
	}
	f.heaters = append(f.heaters, h)
}

func (f *HeaterSystem) Update(dt float32) {

	for _, t := range f.players {
		t.temperature = 0
	}

	for _, h := range f.heaters {
		f.UpdateHeater(h)
	}

	// apply heat to player
	for _, t := range f.players {

		//FIXME HARDCODED

		// are we freezing?
		if t.temperature < f.baseTemperature {
			bt := t.player.VitalSigns().BodyTemperature.SubFraction(0.0005)
			t.player.VitalSigns().BodyTemperature = bt
			continue
		}

		// are we grilled?
		if t.temperature > 2*f.baseTemperature {
			h := t.player.VitalSigns().Health.SubFraction(0.0005)
			t.player.VitalSigns().Health = h
		}

		// we are warm, just fine
		bt := t.player.VitalSigns().BodyTemperature.AddFraction(0.005)
		t.player.VitalSigns().BodyTemperature = bt
	}

}

// applies the inputs to a player
func (f *HeaterSystem) UpdateHeater(h model.Heater) {

	radiator := h.HeatRadiation()
	if radiator == nil {
		return
	}

	collisions := radiator.Body.Collisions()
	for c := range collisions {
		d := c.Shape().UserData
		p, ok := d.(model.PlayerEntity)
		if !ok {
			continue
		}
		t := f.players[p.Basic()]
		if t == nil {
			log.Panicf("😱 Player not found in system, not added?")
		}
		//TODO Account for radius
		t.temperature += h.HeatRadiation().HeatPerTick
	}

}

func (f *HeaterSystem) Remove(b ecs.BasicEntity) {
	// remove heater
	var index int = minions.FindBasic(func(i int) model.BasicEntity { return f.heaters[i] }, len(f.heaters), b)
	if index >= 0 {
		f.heaters = append(f.heaters[:index], f.heaters[index+1:]...)
	}

	// remove from players
	delete(f.players, b)
}
