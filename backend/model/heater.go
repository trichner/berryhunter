package model

import "github.com/trichner/berryhunter/backend/phy"

type HeatRadiator struct {
	Heat   int
	Radius float32
	Body   phy.DynamicCollider
}
