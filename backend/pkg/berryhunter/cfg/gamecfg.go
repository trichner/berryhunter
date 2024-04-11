package cfg

import (
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
)

type GameConfig struct {
	Tokens       []string
	Radius       float32
	ItemRegistry items.Registry
	MobRegistry  mobs.Registry

	ColdFractionNightPerS float32
	ColdFractionDayPerS   float32

	PlayerConfig    PlayerConfig
	ChieftainConfig *ChieftainConfig
}

type ChieftainConfig struct {
	Addr         *string
	PubSubConfig *PubSubConfig
}

type PubSubConfig struct {
	ProjectId string
	TopicId   string
}

type PlayerConfig struct {
	// tickwise loss
	FreezingDamageTickFraction       float32
	StarveDamageTickFraction         float32
	FreezingStarveDamageTickFraction float32
	SatietyLossTickFraction          float32

	// constants for gaining health
	HealthGainTick                    float32
	HealthGainSatietyThreshold        float32
	HealthGainTemperatureThreshold    float32
	HealthGainSatietyLossTickFraction float32

	WalkingSpeedPerTick float32
}
