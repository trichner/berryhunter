package cfg

import (
	"encoding/json"
	"os"
)

type Config struct {
	ApiAddr  string `json:"apiAddr"`
	RestAddr string `json:"restAddr"`
	DataDir  string `json:"dataDir"`
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
	err = json.Unmarshal(dat, config)
	return config, err
}
