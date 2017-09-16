package conf

import (
	"encoding/json"
	"io/ioutil"
)

type Config struct {
	Server struct {
		Port int    `json:"port"`
		Path string `json:"path"`
	} `json:"server"`
	Game struct {
		ColdFractionNightPerS   float32 `json:"coldFractionNightPerSecond"`
		ColdFractionRestingPerS float32 `json:"coldFractionRestingPerSecond"`
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
