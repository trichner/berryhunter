package model

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/net"
)

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
	Viewport() phy.DynamicCollider
	Client() *net.Client
}