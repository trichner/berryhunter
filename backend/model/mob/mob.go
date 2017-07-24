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

func NewMob(body *phy.Circle, drop items.Item) *Mob {
	//TODO
	t := types[rand.Intn(len(types))]

	base := model.NewBaseEntity(body, t)
	m := &Mob{
		BaseEntity: base,
		rand:       rand.New(rand.NewSource(int64(base.Basic().ID()))),
		velocity:   phy.Vec2f{0.04, 0},
		health:     255,
		drop:       drop,
	}
	m.Body.Shape().UserData = m
	return m
}

type Mob struct {
	model.BaseEntity

	health   int
	velocity phy.Vec2f
	rand     *rand.Rand
	drop     items.Item
}

func (m *Mob) Update(dt float32) bool {

	// random in [-1,1)
	alpha := (m.rand.Float32() * 2) - 1

	// can tweak this for more erratic movements
	alpha *= math.Pi / 8

	rot := phy.NewRotMat2f(alpha)
	m.velocity = rot.Mult(m.velocity)

	pos := m.Position()
	pos = pos.Add(m.velocity)
	m.SetPosition(pos)

	return m.health > 0
}

func (m *Mob) Angle() float32 {
	return phy.Vec2f{1, 0}.AngleBetween(m.velocity)
}

func (m *Mob) Health() int {
	return m.health
}

func (m *Mob) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	log.Printf("🎯")
	m.health -= 50
	if m.health <= 0 {
		p.Inventory().AddItem(items.NewItemStack(m.drop, 1))
	}
}
