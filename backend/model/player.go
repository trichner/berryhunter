package model

import "github.com/trichner/berryhunter/backend/items"

type PlayerVitalSigns struct {
	Satiety         int
	BodyTemperature int
	Health          int
}

type PlayerEntity interface {
	Entity
	Name() string
	Equipped() []items.Item
	VitalSigns() *PlayerVitalSigns
	Inventory() *items.Inventory
}
