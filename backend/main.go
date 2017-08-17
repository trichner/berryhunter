package main

import (
	"log"
	"math/rand"
	"time"
	"github.com/trichner/berryhunter/backend/conf"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/items"
	"sort"
	"os"
	"github.com/trichner/berryhunter/backend/model/mob"
	"github.com/trichner/berryhunter/backend/gen"
	"github.com/trichner/berryhunter/backend/mobs"
	"github.com/trichner/berryhunter/backend/sys"
)

func main() {

	config := readConf()
	registry := readItems("../api/items/")
	mobs := readMobs(registry, "../api/mobs/")

	g := &sys.Game{}
	g.Init(config, registry, mobs)

	entities := gen.Generate(g.Items, rand.New(rand.NewSource(0xDEADBEEF)))
	for _, e := range entities {
		g.AddEntity(e)
	}

	mobList := mobs.Mobs()

	if len(mobList) > 0 {
		// add some mobs
		for i := 0; i < 100; i++ {
			n := rand.Int() % len(mobList)
			m := newMobEntity(mobList[n])
			m.SetPosition(phy.Vec2f{float32(i), float32(i)})
			g.AddEntity(m)
		}
	}

	gameLoop(g)
}

// gameLoop starts and runs the actual loop of the entire game
func gameLoop(g *sys.Game) {

	g.Run()

	//---- run game loop
	log.Printf("Starting loop")
	tickrate := time.Millisecond * 33
	ticker := time.NewTicker(tickrate)
	for {
		g.Update()
		<-ticker.C
	}
}

// readMobs parses the mob definitions from the definition files
func readMobs(r items.Registry, path string) mobs.Registry {
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

// readItems parses the item definitions from the definition files
func readItems(path string) items.Registry {
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

// readConf parses the config file
func readConf() *conf.Config {

	configFile := "./conf.json"
	config, err := conf.ReadConfig(configFile)
	if err != nil {
		log.Panicf("Cannot read config '%s':%v", configFile, err)
	}
	return config
}

func newMobEntity(def *mobs.MobDefinition) model.MobEntity {
	circle := phy.NewCircle(phy.VEC2F_ZERO, 0.5)
	return mob.NewMob(circle, def)
}
