package mob

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/items/mobs"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"log"
	"math"
	"math/rand"
	"github.com/trichner/berryhunter/backend/model/vitals"
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
		health:     vitals.Max,
		definition: d,
	}
	m.Body.Shape().UserData = m
	return m
}

type Mob struct {
	model.BaseEntity

	definition *mobs.MobDefinition

	health   vitals.VitalSign
	velocity phy.Vec2f
	rand     *rand.Rand
}

func (m *Mob) MobID() mobs.MobID {
	return m.definition.ID
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

func (m *Mob) Health() vitals.VitalSign {
	return m.health
}

func (m *Mob) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	log.Printf("🎯")

	vulnerability := m.definition.Factors.Vulnerability
	if vulnerability == 0 {
		vulnerability = 1
	}

	dmgFraction := item.Factors.Damage * vulnerability
	m.health = m.health.SubFraction(dmgFraction)

	// is it dead?
	if m.health <= 0 {
		for _, i := range m.definition.Drops {
			p.Inventory().AddItem(i)
		}
	}
}
