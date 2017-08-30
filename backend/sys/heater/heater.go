package heater

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/model"
	"log"
)

type playerSet map[model.PlayerEntity][]model.Heater

type HeaterSystem struct {
	heaters []model.Heater
}

func New() *HeaterSystem {
	return &HeaterSystem{}
}

func (*HeaterSystem) Priority() int {
	return -10
}

func (*HeaterSystem) New(w *ecs.World) {

	log.Println("HeaterSystem nominal")
}

func (f *HeaterSystem) AddHeater(h model.Heater) {
	radiator := h.HeatRadiation()
	if radiator == nil {
		return
	}
	f.heaters = append(f.heaters, h)
}

func (f *HeaterSystem) Update(dt float32) {

	// apply inputs to player
	players := make(playerSet)
	for _, h := range f.heaters {
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
			hl := players[p]
			hl = append(hl, h)
			players[p] = hl
		}

	}

	for p, hl := range players {
		heat := float32(0)
		for _, h := range hl {
			r := h.HeatRadiation()
			d := r.Body.Position().Sub(p.Position())
			diff := d.Abs() / float32(r.Radius) * r.HeatFraction
			heat += diff
		}
		t := p.VitalSigns().BodyTemperature
		p.VitalSigns().BodyTemperature = t.AddFraction(heat)

		if heat > 0.05 {
			//TODO damage player
		}
	}
}

// applies the inputs to a player
func (f *HeaterSystem) UpdateHeater(h model.Heater) {

}

func (f *HeaterSystem) Remove(b ecs.BasicEntity) {
	var delete int = -1
	for index, h := range f.heaters {
		if h.Basic().ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		//e := p.players[delete]
		f.heaters = append(f.heaters[:delete], f.heaters[delete+1:]...)
	}
}
