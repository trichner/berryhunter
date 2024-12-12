package sys

import (
	"fmt"
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/gen"
	"github.com/trichner/berryhunter/pkg/berryhunter/minions"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"log/slog"
	"math/rand"
)

type RespawnSystem struct {
	respawnees []model.Respawnee

	g model.Game
}

func NewRespawnSystem(g model.Game) *RespawnSystem {
	return &RespawnSystem{g: g}
}

func (*RespawnSystem) Priority() int {
	return -70
}

func (r *RespawnSystem) AddRespawnable(e model.Respawnee) {
	r.respawnees = append(r.respawnees, e)
}

func (r *RespawnSystem) Update(dt float32) {
	for _, e := range r.respawnees {
		if e.NeedsRespawn() {
			r.g.RemoveEntity(e.Basic())
			r.respawn(e.ToRespawn())
		}
	}
}

func (r *RespawnSystem) respawn(res model.ResourceEntity) {
	item := res.Resource()
	e := gen.NewStaticEntityBody(res.Type(), item.Name, &item)

	// TODO global random?
	ernd := rand.New(rand.NewSource(rand.Int63()))
	newres, err := gen.NewStaticEntityWithBody(gen.NewRandomPos(r.g.Radius()), e, ernd)
	if err != nil {
		panic(err)
	}

	slog.Debug(fmt.Sprintf("Respawned %s at %.2f/%.2f", newres.Resource().Name, newres.Position().X, newres.Position().Y))

	r.g.AddEntity(newres)
}

func (r *RespawnSystem) Remove(e ecs.BasicEntity) {
	delete := minions.FindBasic(func(i int) model.BasicEntity { return r.respawnees[i] }, len(r.respawnees), e)
	if delete >= 0 {
		// e := p.players[delete]
		r.respawnees = append(r.respawnees[:delete], r.respawnees[delete+1:]...)
	}
}
