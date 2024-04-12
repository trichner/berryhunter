package heater

import (
	"log"

	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/minions"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
)

type playerMap map[uint64]*temperatureEntity

type temperatureEntity struct {
	player      model.PlayerEntity
	temperature uint32
}

type HeaterSystem struct {
	heaters []model.Heater
	players playerMap
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
}

func (f *HeaterSystem) AddPlayer(p model.PlayerEntity) {
	f.players[p.Basic().ID()] = &temperatureEntity{player: p}
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

		// depending on the heaters around, increase the body temperature
		bt := t.player.VitalSigns().BodyTemperature.Add(t.temperature)
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
		t := f.players[p.Basic().ID()]
		if t == nil {
			log.Panicf("😱 Player not found in system, not added?")
		}
		// TODO Account for radius
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
	delete(f.players, b.ID())
}
