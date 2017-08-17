package sys

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/model"
)

type PlayerUpdate struct {
	players []model.PlayerEntity
}

func NewPlayerSystem() *PlayerUpdate {
	return &PlayerUpdate{}
}

func (*PlayerUpdate) Priority() int {
	return -50
}

func (p *PlayerUpdate) AddPlayer(player model.PlayerEntity) {
	p.players = append(p.players, player)
}

func (p *PlayerUpdate) Update(dt float32) {
	for _, player := range p.players {
		player.Update(dt)
	}
}

func (p *PlayerUpdate) Remove(e ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range p.players {
		if entity.Basic().ID() == e.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		//e := p.players[delete]
		p.players = append(p.players[:delete], p.players[delete+1:]...)
	}
}
