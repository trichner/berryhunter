package main

import (
	"bufio"
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
	config, err := cfg.ReadConfig(configFile)
	if err != nil {
		log.Panicf("Cannot read config '%s':%v", configFile, err)
	}
	return config
}

func loadTokens(tokenFile string) []string {
	f, err := os.Open(tokenFile)
	if err != nil {
		log.Printf("Cannot read '%s': %s", tokenFile, err)
		return []string{}
	}
	s := bufio.NewScanner(f)

	tokens := make([]string, 0, 8)
	for s.Scan() {
		tokens = append(tokens, s.Text())
	}

	return tokens
}
