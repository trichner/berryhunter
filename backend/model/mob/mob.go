package mob

import (
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"math/rand"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"math"
	"github.com/trichner/berryhunter/backend/items"
	"log"
	"github.com/trichner/berryhunter/backend/mobs"
)

var _ = model.MobEntity(&Mob{})

var types = func() map[string]model.EntityType {
	t := map[string]model.EntityType{}
	for id, name := range BerryhunterApi.EnumNamesEntityType {
		t[name] = model.EntityType(id)
	}
	return t
}()

func NewMob(body *phy.Circle, d *mobs.MobDefinition) *Mob {
	entityType, ok := types[d.Name]
	if !ok {
		log.Fatalf("Mob type not found: %d/%s", d.ID, d.Name)
	}

	base := model.NewBaseEntity(body, entityType)
	m := &Mob{
		BaseEntity: base,
		rand:       rand.New(rand.NewSource(int64(base.Basic().ID()))),
		velocity:   phy.Vec2f{0.04, 0},
		health:     model.VitalSignMax,
		m:          d,
	}
	m.Body.Shape().UserData = m
	return m
}

type Mob struct {
	model.BaseEntity

	m *mobs.MobDefinition

	health   model.VitalSign
	velocity phy.Vec2f
	rand     *rand.Rand
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

func (m *Mob) Health() model.VitalSign {
	return m.health
}

func (m *Mob) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	log.Printf("🎯")
	m.health -= 50
	if m.health <= 0 {
		for _, i := range m.m.Drops {
			p.Inventory().AddItem(i)
		}
	}
}
