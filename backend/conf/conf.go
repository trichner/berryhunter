package conf

import (
	"encoding/json"
	"io/ioutil"
)

const configFilename = "./conf.json"

type Config struct {
	Port int    `json:"port"`
	Path string `json:"path"`
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
