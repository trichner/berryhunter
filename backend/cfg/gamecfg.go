package cfg

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/items/mobs"
)

type GameConfig struct {
	Tokens       []string
	Radius       float32
	ItemRegistry items.Registry
	MobRegistry  mobs.Registry

	ColdFractionNightPerS   float32
	ColdFractionRestingPerS float32

	PlayerConfig PlayerConfig
}

type PlayerConfig struct {
	// tickwise loss
	FreezingDamageTickFraction float32
	StarveDamageTickFraction   float32
	SatietyLossTickFraction    float32

	// constants for gaining health
	HealthGainTick                    float32
	HealthGainSatietyThreshold        float32
	HealthGainTemperatureThreshold    float32
	HealthGainSatietyLossTickFraction float32

	WalkingSpeedPerTick float32
}