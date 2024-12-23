package cfg

import (
	"encoding/json"
	"log/slog"

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

	TotalDayCycleSeconds uint64
	DayTimeSeconds       uint64

	PlayerConfig    PlayerConfig
	ChieftainConfig *ChieftainConfig
}

func (g *GameConfig) LogValue() slog.Value {
	raw, err := json.Marshal(g)
	if err != nil {
		return slog.AnyValue(err)
	}

	var asMap map[string]any
	err = json.Unmarshal(raw, &asMap)
	if err != nil {
		return slog.AnyValue(err)
	}

	return slog.GroupValue(
		slog.Any("raw", asMap),
	)
}

type ChieftainConfig struct {
	Addr           string
	CaCertFile     string
	ClientCertFile string
	ClientKeyFile  string
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
