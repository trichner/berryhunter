package model

import "github.com/trichner/berryhunter/backend/phy"

type HeatRadiator struct {
	HeatPerTick uint32
	Radius      float32
	Body        phy.DynamicCollider
}
