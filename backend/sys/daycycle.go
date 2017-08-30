package sys

import (
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/minions"
)

type DayCycleSystem struct {
	players []model.PlayerEntity

	g          model.Game
	cycleTicks uint64
}

func NewDayCycleSystem(g model.Game, cycleTicks uint64) *DayCycleSystem {
	return &DayCycleSystem{g: g, cycleTicks: cycleTicks}
}

func (*DayCycleSystem) Priority() int {
	return -20
}

func (d *DayCycleSystem) AddPlayer(e model.PlayerEntity) {
	d.players = append(d.players, e)
}

func (d *DayCycleSystem) Update(dt float32) {
	if d.g.Ticks()%d.cycleTicks > d.cycleTicks/2 {
		for _, p := range d.players {
			temperatureFraction := float32(0.0008)
			t := p.VitalSigns().BodyTemperature.SubFraction(temperatureFraction)
			p.VitalSigns().BodyTemperature = t
		}
	}
}

func (d *DayCycleSystem) Remove(e ecs.BasicEntity) {
	delete := minions.FindBasic(func(i int) model.BasicEntity { return d.players[i] }, len(d.players), e)
	if delete >= 0 {
		//e := p.players[delete]
		d.players = append(d.players[:delete], d.players[delete+1:]...)
	}
}
