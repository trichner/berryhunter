package cfg

import (
	"encoding/json"
	"io/ioutil"
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
	dat, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	// parse config
	config := &Config{}
	err = json.Unmarshal(dat, config)
	return config, err
}
