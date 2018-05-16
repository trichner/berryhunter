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

func NewMob(d *mobs.MobDefinition) *Mob {
	entityType, ok := types[d.Name]
	if !ok {
		log.Fatalf("Mob type not found: %d/%s", d.ID, d.Name)
	}

	mobBody := phy.NewCircle(phy.VEC2F_ZERO, d.Body.Radius)
	mobBody.Shape().Layer = model.LayerViewportCollision | model.LayerActionCollision
	mobBody.Shape().Mask = model.LayerMobStaticCollision | model.LayerBorderCollision

	damageAura := phy.NewCircle(phy.VEC2F_ZERO, d.Body.DamageRadius)
	damageAura.Shape().Layer = model.LayerNoneCollision
	damageAura.Shape().Mask = model.LayerPlayerCollision
	damageAura.Shape().IsSensor = true

	base := model.NewBaseEntity(mobBody, entityType)
	m := &Mob{
		BaseEntity: base,
		rand:       rand.New(rand.NewSource(int64(base.Basic().ID()))),
		velocity:   phy.Vec2f{0.04, 0},
		health:     vitals.Max,
		definition: d,
		damageAura: damageAura,
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

	damageAura *phy.Circle
}

func (m *Mob) Bodies() model.Bodies {
	b := make(model.Bodies, 2)
	b[0] = m.Body
	b[1] = m.damageAura
	return b
}

func (m *Mob) MobID() mobs.MobID {
	return m.definition.ID
}

func (m *Mob) Update(dt float32) bool {

	auraCollisions := m.damageAura.Collisions()
	for c := range auraCollisions {
		p, ok := c.Shape().UserData.(model.PlayerEntity)
		if ok {
			h := p.VitalSigns().Health.SubFraction(m.definition.Factors.DamageFraction)
			p.VitalSigns().Health = h
		}
	}


	// random in [-1,1)
	alpha := (m.rand.Float32() * 2) - 1

	// can tweak this for more erratic movements
	alpha *= math.Pi / 32

	rot := phy.NewRotMat2f(alpha)
	m.velocity = rot.Mult(m.velocity)

	pos := m.Position()
	pos = pos.Add(m.velocity)
	m.SetPosition(pos)

	return m.health > 0
}


func (m *Mob) SetPosition(p phy.Vec2f) {
	m.Body.SetPosition(p)
	m.damageAura.SetPosition(p)
}

func (m *Mob) Angle() float32 {
	// FIXME the angle has to be set when the position is updated
	// => That's where you're wrong kiddo. Vector arithmetic ftw!
	return phy.Vec2f{-1, 0}.AngleBetween(m.velocity)
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
