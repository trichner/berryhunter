package sys

import (
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/minions"
	"github.com/trichner/berryhunter/backend/model/vitals"
)

type DayCycleSystem struct {
	players []model.PlayerEntity

	g                model.Game
	cycleTicks       uint64
	nightCoolPerTick uint32
}

func NewDayCycleSystem(g model.Game, cycleTicks uint64, coldFractionNightPerS float32) *DayCycleSystem {

	coolPerTick := vitals.FractionToAbsPerTick(coldFractionNightPerS)
	return &DayCycleSystem{g: g, cycleTicks: cycleTicks, nightCoolPerTick: coolPerTick}
}

func (*DayCycleSystem) Priority() int {
	return -20
}

func (d *DayCycleSystem) AddPlayer(e model.PlayerEntity) {
	d.players = append(d.players, e)
}

func (d *DayCycleSystem) Update(dt float32) {

	// is it night?
	if d.g.Ticks()%d.cycleTicks > d.cycleTicks/2 {

		// adjust body temp
		for _, p := range d.players {
			 if !p.IsGod() {
				t := p.VitalSigns().BodyTemperature.Sub(d.nightCoolPerTick)
				p.VitalSigns().BodyTemperature = t
			}
		}
	}
}

func (d *DayCycleSystem) Remove(e ecs.BasicEntity) {
	idx := minions.FindBasic(func(i int) model.BasicEntity { return d.players[i] }, len(d.players), e)
	if idx >= 0 {
		//e := p.players[idx]
		d.players = append(d.players[:idx], d.players[idx+1:]...)
	}
}
