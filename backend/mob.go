package main

import (
	"engo.io/ecs"
	"log"
	"github.com/trichner/berryhunter/backend/model"
)

type MobSystem struct {
	mobs []model.MobEntity
	game *Game
}

func NewMobSystem(g *Game) *MobSystem {
	return &MobSystem{game: g}
}

func (n *MobSystem) Priority() int {
	return 20
}

func (n *MobSystem) New(w *ecs.World) {
	log.Println("MobSystem nominal")
}

func (n *MobSystem) AddEntity(e model.MobEntity) {
	n.mobs = append(n.mobs, e)
}

func (n *MobSystem) Update(dt float32) {

	for _, mob := range n.mobs {
		alive := mob.Update(dt)
		if !alive {
			n.game.RemoveEntity(mob.Basic())
		}
	}
}

func (n *MobSystem) Remove(b ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range n.mobs {
		if entity.Basic().ID() == b.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		//e := p.players[delete]
		n.mobs = append(n.mobs[:delete], n.mobs[delete+1:]...)
	}
}
