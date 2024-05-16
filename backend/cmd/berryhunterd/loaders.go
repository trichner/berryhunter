package main

import (
	"bufio"
	_ "embed"
	"errors"
	"fmt"
	"log"
	"log/slog"
	"os"
	"sort"
	"strings"

	aitems "github.com/trichner/berryhunter/pkg/api/items"
	amobs "github.com/trichner/berryhunter/pkg/api/mobs"
	"github.com/trichner/berryhunter/pkg/berryhunter/cfg"
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
)

//go:embed conf.default.json
var defaultConfig []byte

// loadMobs parses the mob definitions from the definition files
func loadMobs(r items.Registry) mobs.Registry {
	registry, err := mobs.RegistryFromFS(r, amobs.Mobs)
	if err != nil {

		log.Printf("Error: %s", err)
		os.Exit(1)
	}

	mobList := registry.Mobs()
	slog.Info("Loaded mob definitions", slog.Int("count", len(mobList)))
	sort.Sort(mobs.ByID(mobList))
	for _, m := range mobList {
		slog.Debug(fmt.Sprintf("%3d: %s (%s)", m.ID, m.Name, m.Type))
	}
	return registry
}

// loadItems parses the item definitions from the definition files
func loadItems() items.Registry {
	// registry, err := items.RegistryFromPaths(path)
	registry, err := items.RegistryFromFS(aitems.Items)
	if err != nil {
		slog.Error("Error: %s", err)
		os.Exit(1)
	}

	itemList := registry.Items()
	slog.Info("Loaded item definitions", slog.Int("count", len(itemList)))
	sort.Sort(items.ByID(itemList))
	for _, i := range itemList {
		slog.Debug(fmt.Sprintf("%3d: %s (%d)", i.ID, i.Name, i.Type))
	}
	return registry
}

// loadConf parses the config file
func loadConf() *cfg.Config {
	configFile := strings.TrimSpace(os.Getenv("BERRYHUNTERD_CONF"))
	if configFile == "" {
		configFile = "./conf.json"
	}
	slog.Info("reading config", slog.String("path", configFile))
	config, err := cfg.ReadConfig(configFile)
	if errors.Is(err, os.ErrNotExist) {
		config, err = setupDefaultConfig()
		if err != nil {
			log.Panicf("Cannot read config '%s':%v", configFile, err)
		}
	} else if err != nil {
		log.Panicf("Cannot read config '%s':%v", configFile, err)
	}
	return config
}

// setupDefaultConfig creates a default config file if non is found
func setupDefaultConfig() (*cfg.Config, error) {

	path := "./conf.json"
	slog.Info("setting up default config", slog.String("path", path))
	err := os.WriteFile(path, defaultConfig, 0644)
	if err != nil {
		return nil, fmt.Errorf("cannot write default config: %w", err)
	}

	return cfg.ReadConfig(path)
}
func loadTokens(tokenFile string) []string {
	f, err := os.Open(tokenFile)
	if err != nil {
		slog.Info("Cannot read tokens", slog.String("file", tokenFile), slog.Any("error", err))
		return []string{}
	}
	s := bufio.NewScanner(f)

	tokens := make([]string, 0, 8)
	for s.Scan() {
		tokens = append(tokens, s.Text())
	}

	return tokens
}
