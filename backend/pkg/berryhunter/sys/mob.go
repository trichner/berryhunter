package sys

import (
	"log"
	"math/rand"

	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/mob"
	"github.com/trichner/berryhunter/pkg/berryhunter/wrand"
)

type MobSystem struct {
	mobs []model.MobEntity
	game model.Game
	rnd  *rand.Rand
}

func NewMobSystem(g model.Game, seed int64) *MobSystem {
	rnd := rand.New(rand.NewSource(seed))
	return &MobSystem{game: g, rnd: rnd}
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
			n.respawnMob(mob.MobDefinition())
		}
	}
}

func (n *MobSystem) respawnMob(d *mobs.MobDefinition) {
	m := mob.NewMob(d, d.Generator.RespawnBehavior == mobs.RespawnBehaviorRandomLocation)

	if d.Generator.RespawnBehavior == mobs.RespawnBehaviorProcreation {
		randomMob := n.randomMob(d.ID)
		if randomMob != nil {
			m.SetPosition(randomMob.Position())
			m.SetAngle(randomMob.Angle())
		}
	}

	n.game.AddEntity(m)
}

func (n *MobSystem) randomMob(id mobs.MobID) model.MobEntity {
	choices := []wrand.Choice{}
	for _, m := range n.mobs {
		if m.MobID() == id {
			choices = append(choices, wrand.Choice{Weight: 1, Choice: m})
		}
	}
	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(n.rnd)
	if selected == nil {
		return nil
	}
	return selected.(model.MobEntity)
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
		// e := p.players[delete]
		n.mobs = append(n.mobs[:delete], n.mobs[delete+1:]...)
	}
}
