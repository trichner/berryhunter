package model

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model/vitals"
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

type Players []PlayerEntity

type PlayerEntity interface {
	Entity
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
