package freezer

import (
	"engo.io/ecs"
	"log"
	"github.com/trichner/berryhunter/backend/model"
)

type FreezerSystem struct {
	heaters []model.Heater
}

func New() *FreezerSystem {
	return &FreezerSystem{}
}

func (*FreezerSystem) Priority() int {
	return -10
}

func (*FreezerSystem) New(w *ecs.World) {

	log.Println("FreezerSystem nominal")
}

func (f *FreezerSystem) AddHeater(h model.Heater) {
	radiator := h.HeatRadiation()
	if radiator == nil {
		return
	}
	f.heaters = append(f.heaters, h)
}

func (f *FreezerSystem) Update(dt float32) {

	// apply inputs to player
	for _, h := range f.heaters {
		f.UpdateHeater(h)
	}
}

// applies the inputs to a player
func (f *FreezerSystem) UpdateHeater(h model.Heater) {

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
		t := p.VitalSigns().BodyTemperature
		heat := uint32(radiator.Heat)
		heat *= 1000000
		p.VitalSigns().BodyTemperature = t.Add(heat)
	}
}

func (f *FreezerSystem) Remove(b ecs.BasicEntity) {
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
