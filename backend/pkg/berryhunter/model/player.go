package model

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/cfg"
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/vitals"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
)

type PlayerVitalSigns struct {
	Satiety         vitals.VitalSign
	BodyTemperature vitals.VitalSign
	Health          vitals.VitalSign
}

type Hand struct {
	Collider phy.DynamicCollider
	Item     items.Item
}

type Stats struct {
	BirthTick uint64
}

type Players []PlayerEntity

type PlayerEntity interface {
	Entity
	StatusEntity

	Name() string
	Equipment() *items.Equipment
	VitalSigns() *PlayerVitalSigns
	Inventory() *items.Inventory
	Viewport() phy.DynamicCollider
	Hand() *Hand
	Client() Client
	SetAngle(a float32)

	Update(dt float32)
	OwnedEntities() BasicEntities

	AddAction(a PlayerAction)
	CurrentAction() PlayerAction

	SetGodmode(on bool)
	IsGod() bool
	WasGod() bool

	Config() *cfg.PlayerConfig
	Stats() *Stats
}

type BasicEntities map[uint64]ecs.BasicEntity

func NewBasicEntities() BasicEntities {
	return make(BasicEntities)
}

func (b BasicEntities) All() []ecs.BasicEntity {
	entities := []ecs.BasicEntity{}
	for _, v := range b {
		entities = append(entities, v)
	}
	return entities
}

func (b BasicEntities) Add(e BasicEntity) {
	b[e.Basic().ID()] = e.Basic()
}

func (b BasicEntities) Remove(e BasicEntity) {
	delete(b, e.Basic().ID())
}

type VitalSignEntity interface {
	BasicEntity
	VitalSigns() *PlayerVitalSigns
}

type PlayerInteraction interface {
	HitMob(m *MobEntity)
	KilledMob(m *MobEntity)
}
