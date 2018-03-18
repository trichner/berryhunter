package main

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/items/mobs"
	"log"
	"os"
	"sort"
	"bufio"
	"github.com/trichner/berryhunter/backend/cfg"
)

// loadMobs parses the mob definitions from the definition files
func loadMobs(r items.Registry, path string) mobs.Registry {
	registry, err := mobs.RegistryFromPaths(r, path)
	if err != nil {

		log.Printf("Error: %s", err)
		os.Exit(1)
	}

	mobList := registry.Mobs()
	log.Printf("Loaded %d mob definitions:", len(mobList))
	sort.Sort(mobs.ByID(mobList))
	for _, m := range mobList {
		log.Printf("%3d: %s (%s)", m.ID, m.Name, m.Type)
	}
	return registry
}

// loadItems parses the item definitions from the definition files
func loadItems(path string) items.Registry {
	registry, err := items.RegistryFromPaths(path)
	if err != nil {

		log.Printf("Error: %s", err)
		os.Exit(1)
	}

	itemList := registry.Items()
	log.Printf("Loaded %d item definitions:", len(itemList))
	sort.Sort(items.ByID(itemList))
	for _, i := range itemList {
		log.Printf("%3d: %s (%d)", i.ID, i.Name, i.Type)
	}
	return registry
}

// loadConf parses the config file
func loadConf() *cfg.Config {

	configFile := "./conf.json"
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