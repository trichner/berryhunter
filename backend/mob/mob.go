package mob

import (
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"math/rand"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"math"
	"log"
)

var _ = model.MobEntity(&Mob{})

func NewMob(body *phy.Circle) *Mob {
	//TODO
	base := model.NewBaseEntity(body, DeathioApi.EntityTypeBerryBush)
	m := &Mob{
		BaseEntity: base,
		rand:       rand.New(rand.NewSource(int64(base.Basic().ID()))),
		velocity:   phy.Vec2f{0.08, 0},
	}
	m.Body.Shape().UserData = m
	return m
}

type Mob struct {
	model.BaseEntity

	health   int
	velocity phy.Vec2f
	rand     *rand.Rand
}

func (m *Mob) Update(dt float32) {

	// random in [-1,1)
	alpha := (m.rand.Float32() * 2) - 1

	// can tweek this for more eradic movements
	alpha *= math.Pi / 2

	rot := phy.NewRotMat2f(alpha)
	m.velocity = rot.Mult(m.velocity)

	pos := m.Position()
	pos = pos.Add(m.velocity)
	m.SetPosition(pos)
}

func (m *Mob) Health() int {
	return m.health
}

