package cfg

import (
	"encoding/json"
	"fmt"
	"os"
)

type Server struct {
	Port        int    `json:"port"`
	TlsHost     string `json:"tlsHost"`
	FrontendDir string `json:"frontendDir"`
}

type Config struct {
	Server    Server `json:"server"`
	Chieftain struct {
		Addr string `json:"addr"`

		CaCertFile     string `json:"caCertFile"`
		ClientCertFile string `json:"clientCertFile"`
		ClientKeyFile  string `json:"clientKeyFile"`
	} `json:"chieftain,omitempty"`
	Game struct {
		ColdFractionDayPerS   float32 `json:"coldFractionDayPerSecond"`
		ColdFractionNightPerS float32 `json:"coldFractionNightPerSecond"`
		TotalDayCycleSeconds  uint64  `json:"totalDayCycleSeconds"`
		DayTimeSeconds        uint64  `json:"dayTimeSeconds"`
		Player                struct {
			FreezingDamageTickFraction       float32 `json:"freezingDamageTickFraction"`
			StarveDamageTickFraction         float32 `json:"starveDamageTickFraction"`
			FreezingStarveDamageTickFraction float32 `json:"freezingStarveDamageTickFraction"`
			SatietyLossTickFraction          float32 `json:"satietyLossTickFraction"`

			// constants for gaining health
			HealthGainTick                    float32 `json:"healthGainTick"`
			HealthGainSatietyThreshold        float32 `json:"healthGainSatietyThreshold"`
			HealthGainTemperatureThreshold    float32 `json:"healthGainTemperatureThreshold"`
			HealthGainSatietyLossTickFraction float32 `json:"healthGainSatietyLossTickFraction"`

			//
			WalkingSpeedPerTick float32 `json:"walkingSpeedPerTick"`
		} `json:"player"`
	} `json:"game"`
}

// reads the config from file
func ReadConfig(filename string) (*Config, error) {
	var err error
	// read file
	dat, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	// parse config
	config := &Config{}
	if err := json.Unmarshal(dat, config); err != nil {
		return nil, err
	}

	// Default if values are missing
	if config.Game.TotalDayCycleSeconds <= 0 {
		config.Game.TotalDayCycleSeconds = 600
	}
	if config.Game.DayTimeSeconds <= 0 {
		config.Game.DayTimeSeconds = 400
	}
	// Validate
	if config.Game.DayTimeSeconds > config.Game.TotalDayCycleSeconds {
		return config, fmt.Errorf("invalid configuration: DayTimeSeconds (%d) must not be larger than TotalDayCycleSeconds (%d)",
			config.Game.DayTimeSeconds, config.Game.TotalDayCycleSeconds)
	}
	return config, err
}
