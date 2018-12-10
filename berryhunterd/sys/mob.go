package sys

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/berryhunterd/items/mobs"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/berryhunterd/model/mob"
	"log"
	"math/rand"
)

type MobSystem struct {
	mobs []model.MobEntity
	game model.Game
}

func NewMobSystem(g model.Game) *MobSystem {
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
			n.RespawnMob(mob.MobDefinition())
		}
	}
}

func (n *MobSystem) RespawnMob(d *mobs.MobDefinition) {
	m := mob.NewMob(d)

	randomMob := *n.randomMob(d.ID)
	if (randomMob == nil) {
		log.Printf("Can't find random mob with id: %d. New mob will be spawned at 0/0.", d.ID)
	} else {
		m.SetPosition(randomMob.Position())
		m.SetAngle(randomMob.Angle())
	}

	n.game.AddEntity(m)
}

func (n *MobSystem) randomMob(id mobs.MobID) *model.MobEntity {
	var current model.MobEntity = nil;
	var count int = 0;
	for _, entity := range n.mobs {
		count++;
		if (rand.Intn(count) == 0) {
			current = entity;
		}
	}

	return &current;
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
