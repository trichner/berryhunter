package model

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/net"
)

const VitalSignMax = ^VitalSign(0)

type VitalSign uint32

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

type PlayerEntity interface {
	Entity
	Name() string
	Equipped() []items.Item
	VitalSigns() *PlayerVitalSigns
	Inventory() *items.Inventory
	Viewport() phy.DynamicCollider
	Client() *net.Client

	Update(dt float32)
	UpdateInput(next, last *PlayerInput)
}

type VitalSignEntity interface {
	BasicEntity
	VitalSigns() *PlayerVitalSigns
}

type PlayerInteraction interface {
	HitMob(m *MobEntity)
	KilledMob(m *MobEntity)
}