package mob

import (
	"fmt"
	"github.com/trichner/berryhunter/pkg/berryhunter/gen"
	"log"
	"math"
	"math/rand"

	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/vitals"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
)

var _ = model.MobEntity(&Mob{})

var types = func() map[string]model.EntityType {
	t := map[string]model.EntityType{}
	for id, name := range BerryhunterApi.EnumNamesEntityType {
		t[name] = model.EntityType(id)
	}
	return t
}()

var namesEnumDamages = map[string]model.CollisionLayer{
	"Player":    model.LayerPlayerCollision,
	"Placeable": model.LayerPlaceableCollision,
	"All":       model.LayerPlayerCollision | model.LayerPlaceableCollision,
}

func NewMob(d *mobs.MobDefinition, rndPos bool, radius float32) *Mob {
	entityType, ok := types[d.Name]
	if !ok {
		log.Fatalf("Mob type not found: %d/%s", d.ID, d.Name)
	}

	mobBody := phy.NewCircle(phy.VEC2F_ZERO, d.Body.Radius)
	if d.Body.CollisionLayer <= 0 {
		mobBody.Shape().Layer = int(model.LayerViewportCollision | model.LayerActionCollision)
	} else {
		mobBody.Shape().Layer = d.Body.CollisionLayer
	}
	if d.Body.CollisionMask <= 0 {
		mobBody.Shape().Mask = int(model.LayerMobStaticCollision | model.LayerBorderCollision)
	} else {
		mobBody.Shape().Mask = d.Body.CollisionMask
	}

	damageAura := phy.NewCircle(phy.VEC2F_ZERO, d.Body.DamageRadius)
	damageAura.Shape().Layer = int(model.LayerNoneCollision)
	damageAuraMask := namesEnumDamages["Player"]
	if d.Body.Damages != "" {
		damageAuraMask, ok = namesEnumDamages[d.Body.Damages]
		if !ok {
			panic(fmt.Sprintf("Can not convert damages: %s to a collision mask for %s.", d.Body.Damages, d.Name))
		}
	}
	damageAura.Shape().Mask = int(damageAuraMask)
	damageAura.Shape().IsSensor = true

	base := model.NewBaseEntity(mobBody, entityType)
	rnd := rand.New(rand.NewSource(int64(base.Basic().ID())))
	m := &Mob{
		BaseEntity:         base,
		rand:               rnd,
		heading:            phy.Vec2f{1, 0},
		health:             vitals.Max,
		definition:         d,
		damageAura:         damageAura,
		wanderAcceleration: phy.Vec2f{d.Factors.TurnRate, 0},
		wanderDeltaPhi:     2 * math.Pi * d.Factors.DeltaPhi,
		// TODO use walkingSpeedPerTick from global config
		velocity:      0.055 * d.Factors.Speed,
		statusEffects: model.NewStatusEffects(),
	}
	m.Body.Shape().UserData = m
	if rndPos {
		// TODO use global radius instead hard-coded copy
		m.SetPosition(gen.NewRandomPos(radius))
		m.SetAngle(rnd.Float32() * 2 * math.Pi)
	}
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
		usr := c.Shape().UserData
		if usr == nil {
			log.Printf("Missing UserData!")
			continue
		}

		r, ok := usr.(model.Interacter)
		if !ok {
			log.Printf("Non conformant UserData: %T", usr)
			continue
		}
		r.MobTouches(m, m.definition.Factors)
	}

	// TODO:
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
//	      heading * wanderDistance
//	  D ----------------->
//						   / acceleration
//	                   v
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
	m.heading = phy.NewRotMat2f(a).Mult(phy.Vec2f{-1, 0})
}

func (m *Mob) Health() vitals.VitalSign {
	return m.health
}

func (m *Mob) takeDamage(damage float32, s model.StatusEffect) {
	vulnerability := m.definition.Factors.Vulnerability
	if vulnerability == 0 {
		vulnerability = 1
	}

	dmgFraction := damage * vulnerability
	if dmgFraction > 0 {
		m.health = m.health.SubFraction(dmgFraction)
		m.StatusEffects().Add(s)
	}
}

func (m *Mob) PlayerHitsWith(p model.PlayerEntity, item items.Item) {
	log.Printf("🎯")

	m.takeDamage(item.Factors.Damage, model.StatusEffectDamaged)
	// is it dead?
	if m.health <= 0 {
		for _, i := range m.definition.Drops {
			p.Inventory().AddItem(i)
		}
	}
}

func (m *Mob) MobTouches(e model.MobEntity, factors mobs.Factors) {
	log.Printf("👉")

	m.takeDamage(factors.DamageFraction, model.StatusEffectDamagedAmbient)
}
