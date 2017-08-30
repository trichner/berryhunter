package model

import "github.com/trichner/berryhunter/backend/phy"

type HeatRadiator struct {
	HeatFraction float32
	Radius       float32
	Body         phy.DynamicCollider
}
