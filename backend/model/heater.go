package model

import "github.com/trichner/berryhunter/backend/phy"

type HeatRadiator struct {
	HeatPerTick float32
	Radius      float32
	Body        phy.DynamicCollider
}
