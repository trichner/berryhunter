package cfg

import (
	"encoding/json"
	"github.com/trichner/berryhunter/berryhunterd/model/factors"
	"io/ioutil"
)

type Config struct {
	Server struct {
		Port int    `json:"port"`
		Path string `json:"path"`
	} `json:"server"`
	Chieftain *struct {
		Addr *string `json:"addr"`
		PubSub *struct {
			ProjectId string `json:"projectId"`
			TopicId string `json:"topicId"`
		} `json:"pubSub,omitempty"`
	} `json:"chieftain,omitempty"`
	Game struct {
		ColdFractionDayPerS   float32 `json:"coldFractionDayPerSecond"`
		ColdFractionNightPerS float32 `json:"coldFractionNightPerSecond"`
		Player         factors.PlayerFactorsDefinition        `json:"player"`
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
