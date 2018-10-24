package model

import "github.com/trichner/berryhunter/berryhunterd/phy"

type HeatRadiator struct {
	HeatPerTick uint32
	Radius      float32
	Body        phy.DynamicCollider
}
