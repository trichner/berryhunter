package cfg

import (
	"encoding/json"
	"os"
)

type Config struct {
	ApiTlsHost string `json:"apiTlsHost"`
	ApiAddr    string `json:"apiAddr"`

	RestTlsHost string `json:"restTlsHost"`
	RestAddr    string `json:"restAddr"`

	DataDir string `json:"dataDir"`
}

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
