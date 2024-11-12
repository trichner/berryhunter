package sys

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/minions"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/vitals"
)

type DayCycleSystem struct {
	players []model.PlayerEntity

	g                model.Game
	totalCycleTicks  uint64
	dayTimeTicks     uint64
	nightCoolPerTick uint32
	dayCoolPerTick   uint32
}

func NewDayCycleSystem(g model.Game, totalCycleTicks uint64, dayCycleTicks uint64, coldFractionNightPerS float32,
	coldFractionDayPerS float32,
) *DayCycleSystem {
	nightCoolPerTick := vitals.FractionToAbsPerTick(coldFractionNightPerS)
	dayCoolPerTick := vitals.FractionToAbsPerTick(coldFractionDayPerS)
	return &DayCycleSystem{
		g:                g,
		totalCycleTicks:  totalCycleTicks,
		dayTimeTicks:     dayCycleTicks,
		nightCoolPerTick: nightCoolPerTick,
		dayCoolPerTick:   dayCoolPerTick,
	}
}

func (*DayCycleSystem) Priority() int {
	return -20
}

func (d *DayCycleSystem) AddPlayer(e model.PlayerEntity) {
	d.players = append(d.players, e)
}

func (d *DayCycleSystem) Update(dt float32) {
	// Calculate the total cycle length (sum of day and night)
	totalCycleTicks := d.totalCycleTicks

	// Get the current tick in the cycle
	currentTick := d.g.Ticks() % totalCycleTicks

	// Determine if it's day or night
	var c uint32 // Cooling rate per tick
	if currentTick < d.dayTimeTicks {
		// It's day
		c = d.dayCoolPerTick
	} else {
		// It's night
		c = d.nightCoolPerTick
	}

	// Adjust body temperature for all players
	for _, p := range d.players {
		if p.IsGod() {
			continue // Skip god players
		}

		// Subtract the cooling rate from the player's body temperature
		t := p.VitalSigns().BodyTemperature.Sub(c)
		p.VitalSigns().BodyTemperature = t
	}
}

func (d *DayCycleSystem) Remove(e ecs.BasicEntity) {
	idx := minions.FindBasic(func(i int) model.BasicEntity { return d.players[i] }, len(d.players), e)
	if idx >= 0 {
		// e := p.players[idx]
		d.players = append(d.players[:idx], d.players[idx+1:]...)
	}
}
