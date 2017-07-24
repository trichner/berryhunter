package mob

import (
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"math/rand"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"math"
	"github.com/trichner/berryhunter/backend/items"
	"log"
)

var _ = model.MobEntity(&Mob{})

var types = []model.EntityType{
	DeathioApi.EntityTypeDodo,
	DeathioApi.EntityTypeMammoth,
	DeathioApi.EntityTypeSaberToothCat,
}

func NewMob(body *phy.Circle) *Mob {
	//TODO
	t := types[rand.Intn(len(types))]

	base := model.NewBaseEntity(body, t)
	m := &Mob{
		BaseEntity: base,
		rand:       rand.New(rand.NewSource(int64(base.Basic().ID()))),
		velocity:   phy.Vec2f{0.04, 0},
		health:     255,
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
	alpha *= math.Pi / 8

	rot := phy.NewRotMat2f(alpha)
	m.velocity = rot.Mult(m.velocity)

	pos := m.Position()
	pos = pos.Add(m.velocity)
	m.SetPosition(pos)
}

func (m *Mob) Angle() float32 {
	return phy.Vec2f{1, 0}.AngleBetween(m.velocity)
}

func (m *Mob) Health() int {
	return m.health
}

func (m *Mob) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	log.Printf("🎯 Outch, mob was hit!")
	m.health -= 5
	if m.health < 0 {
		log.Printf("💀")
	}
}
