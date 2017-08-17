package model

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/phy"
)

const VitalSignMax = ^VitalSign(0)

type VitalSign uint32

func (v VitalSign) AddFraction(n float32) VitalSign {
	add := uint32(float32(VitalSignMax) * n)
	return v.Add(add)
}

func (v VitalSign) SubFraction(n float32) VitalSign {
	sub := uint32(float32(VitalSignMax) * n)
	return v.Sub(sub)
}

func (v VitalSign) Add(n uint32) VitalSign {
	d := VitalSignMax - v
	add := VitalSign(n)
	if d > add {
		return v + add
	}
	return VitalSignMax
}

func (v VitalSign) Sub(n uint32) VitalSign {
	sub := VitalSign(n)
	if v < sub {
		return 0
	}
	return v - sub
}

func (v VitalSign) UInt32() uint32 {
	return uint32(v)
}

type PlayerVitalSigns struct {
	Satiety         VitalSign
	BodyTemperature VitalSign
	Health          VitalSign
}

type Hand struct {
	Collider phy.DynamicCollider
	Item     items.Item
}

type Players []PlayerEntity

type PlayerEntity interface {
	Entity
	Name() string
	Equipment() *items.Equipment
	VitalSigns() *PlayerVitalSigns
	Inventory() *items.Inventory
	Craft(i items.Item) bool
	Viewport() phy.DynamicCollider
	Hand() *Hand
	Client() Client
	SetAngle(a float32)

	Update(dt float32)
	//UpdateInput(next, last *PlayerInput)
}

type VitalSignEntity interface {
	BasicEntity
	VitalSigns() *PlayerVitalSigns
}

type PlayerInteraction interface {
	HitMob(m *MobEntity)
	KilledMob(m *MobEntity)
}
