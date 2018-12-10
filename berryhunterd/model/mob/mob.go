package mob

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/items/mobs"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/berryhunterd/model/vitals"
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"log"
	"math/rand"
	"math"
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
	mobBody.Shape().Layer = int(model.LayerViewportCollision | model.LayerActionCollision)
	mobBody.Shape().Mask = int(model.LayerMobStaticCollision | model.LayerBorderCollision)

	damageAura := phy.NewCircle(phy.VEC2F_ZERO, d.Body.DamageRadius)
	damageAura.Shape().Layer = int(model.LayerNoneCollision)
	damageAura.Shape().Mask = int(model.LayerPlayerCollision)
	damageAura.Shape().IsSensor = true

	base := model.NewBaseEntity(mobBody, entityType)
	m := &Mob{
		BaseEntity:         base,
		rand:               rand.New(rand.NewSource(int64(base.Basic().ID()))),
		heading:            phy.Vec2f{1, 0},
		health:             vitals.Max,
		definition:         d,
		damageAura:         damageAura,
		wanderAcceleration: phy.Vec2f{d.Factors.TurnRate, 0},
		wanderDeltaPhi:     2 * math.Pi * d.Factors.DeltaPhi,
		// TODO use walkingSpeedPerTick from global config
		velocity:           0.055 * d.Factors.Speed,
		statusEffects:      model.NewStatusEffects(),
	}
	m.Body.Shape().UserData = m
	return m
}

type Mob struct {
	model.BaseEntity

	definition *mobs.MobDefinition

	health  vitals.VitalSign
	heading phy.Vec2f
	rand    *rand.Rand

	damageAura *phy.Circle

	// wandering
	wanderAcceleration phy.Vec2f
	wanderDeltaPhi     float32
	velocity           float32

	statusEffects model.StatusEffects
}

func (m *Mob) StatusEffects() *model.StatusEffects {
	return &m.statusEffects
}

func (m *Mob) Bodies() model.Bodies {
	b := m.BaseEntity.Bodies()
	return append(b, m.damageAura)
}

func (m *Mob) MobID() mobs.MobID {
	return m.definition.ID
}

func (m *Mob) MobDefinition() *mobs.MobDefinition {
	return m.definition
}

func (m *Mob) Update(dt float32) bool {

	auraCollisions := m.damageAura.Collisions()
	for c := range auraCollisions {
		p, ok := c.Shape().UserData.(model.PlayerEntity)
		if ok {
			if p.IsGod() {
				continue
			}
			if m.definition.Factors.DamageFraction != 0 {
				h := p.VitalSigns().Health.SubFraction(m.definition.Factors.DamageFraction)
				p.VitalSigns().Health = h
				p.StatusEffects().Add(model.StatusEffectDamagedAmbient)
			}
		}
	}

	//TODO:
	// A: Wandering
	// - http://natureofcode.com/book/chapter-6-autonomous-agents/
	// B: Environment Awareness
	// - add 'horizon' circle
	// - calculate collision response on 'horizon' circle and use as 'desired' heading

	// wandering
	m.heading, m.wanderAcceleration = wander(m.heading, m.wanderAcceleration, m.wanderDeltaPhi, m.rand)
	pos := m.Position().Add(m.heading.Mult(m.velocity))
	m.SetPosition(pos)

	return m.health > 0
}

// http://natureofcode.com/book/chapter-6-autonomous-agents/
//
//       heading * wanderDistance
//   D ----------------->
//					   / acceleration
//                    v
//
func wander(heading, acceleration phy.Vec2f, deltaPhi float32, r *rand.Rand) (newHeading, newAcceleration phy.Vec2f) {
	const wanderDistance float32 = 1

	wanderHeading := heading.Normalize().Mult(wanderDistance)

	// rotate wanderAcceleration by a random angle
	phi := (r.Float32()*2 - 1) * deltaPhi
	rMat := phy.NewRotMat2f(phi)
	acceleration = rMat.Mult(acceleration)

	// update the heading
	h := wanderHeading.Add(acceleration).Normalize()
	return h.Normalize(), acceleration
}

func (m *Mob) SetPosition(p phy.Vec2f) {
	m.Body.SetPosition(p)
	m.damageAura.SetPosition(p)
}

func (m *Mob) Angle() float32 {
	// FIXME the angle has to be set when the position is updated
	// => That's where you're wrong kiddo. Vector arithmetic ftw!
	return phy.Vec2f{-1, 0}.AngleBetween(m.heading)
}

func (m *Mob) SetAngle(a float32) {
	m.heading = phy.NewPolarVec2f(1, a).Mult(-1);
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
	if dmgFraction > 0 {
		m.health = m.health.SubFraction(dmgFraction)
		m.StatusEffects().Add(BerryhunterApi.StatusEffectDamaged)

		// is it dead?
		if m.health <= 0 {
			for _, i := range m.definition.Drops {
				p.Inventory().AddItem(i)
			}
		}
	}
}
