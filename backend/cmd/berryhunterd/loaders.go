package main

import (
	"bufio"
	_ "embed"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/google/uuid"

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
		slog.Error("failed to load mobs", slog.Any("err", err))
		panic(err)
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
		slog.Error("failed to load items", slog.Any("err", err))
		panic(err)
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
			slog.Error("cannot read config", slog.String("file", configFile), slog.Any("err", err))
			panic(err)
		}
	} else if err != nil {
		slog.Error("cannot read config", slog.String("file", configFile), slog.Any("err", err))
		panic(err)
	}
	return config
}

// setupDefaultConfig creates a default config file if non is found
func setupDefaultConfig() (*cfg.Config, error) {
	path := "./conf.json"
	slog.Info("setting up default config", slog.String("path", path))
	err := os.WriteFile(path, defaultConfig, 0o644)
	if err != nil {
		return nil, fmt.Errorf("cannot write default config: %w", err)
	}

	return cfg.ReadConfig(path)
}

func loadOrCreateTokens(tokenFile string) []string {
	f, err := os.Open(tokenFile)
	if os.IsNotExist(err) {
		absPath, _ := filepath.Abs(tokenFile)
		slog.Info("Tokens file not found, creating", slog.String("file", absPath))
		tkns, err := createTokens(tokenFile)
		if err != nil {
			slog.Info("failed to create token file, temporary token created", slog.String("token", tkns[0]))
			return []string{}
		}
		return tkns
	} else if err != nil {
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

func createTokens(tokenFile string) ([]string, error) {
	s := uuid.Must(uuid.NewRandom()).String()

	err := os.WriteFile(tokenFile, []byte(s+"\n"), 0o644)
	if err != nil {
		absPath, _ := filepath.Abs(tokenFile)
		return nil, fmt.Errorf("failed to create tokens file %s: %w", absPath, err)
	}
	return []string{s}, err
}
