package model

import "github.com/trichner/berryhunter/pkg/berryhunter/phy"

type HeatRadiator struct {
	HeatPerTick uint32
	Radius      float32
	Body        phy.DynamicCollider
}
