package main

import (
	"flag"
	"fmt"
	"github.com/trichner/berryhunter/backend/core"
	"github.com/trichner/berryhunter/backend/gen"
	"github.com/trichner/berryhunter/backend/items/mobs"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/model/mob"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/wrand"
	"log"
	"math/rand"
	"net/http"
	"os"
)

func main() {

	config := loadConf()
	registry := loadItems("../api/items/")
	mobs := loadMobs(registry, "../api/mobs/")

	tokens := loadTokens("./tokens.list")
	log.Printf("👮‍♀️ Read %d tokens.", len(tokens))

	// new game
	var radius float32 = 20
	g, err := core.NewGameWith(
		core.Config(config),
		core.Registries(registry, mobs),
		core.Tokens(tokens),
		core.Radius(radius),
	)
	if err != nil {
		panic(err)
	}

	// populate game
	rnd := rand.New(rand.NewSource(0xDEADBEEF+5)) // 3?
	entities := gen.Generate(g.Items(), rnd, radius)
	for _, e := range entities {
		g.AddEntity(e)
	}

	mobList := mobs.Mobs()

	if len(mobList) > 0 {
		// add some mobs
		for i := 0; i < 70; i++ {
			m := newRandomMobEntity(mobList, rnd, radius)
			g.AddEntity(m)
		}
	}

	//---- set up server
	var dev, help bool
	flag.BoolVar(&dev, "dev", false, "Serve frontend directly")
	flag.BoolVar(&help, "help", false, "Show usage help")
	flag.Parse()
	if help {
		flag.Usage()
		os.Exit(1)
	}

	bootServer(g.Handler(), config.Server.Port, config.Server.Path, dev)

	g.Loop()
}

func bootServer(h http.HandlerFunc, port int, path string, dev bool) {

	log.Printf("🦄 Booting server at :%d%s", port, path)
	addr := fmt.Sprintf(":%d", port)
	http.HandleFunc(path, h)

	if dev {
		log.Print("Using development server.")
		http.Handle("/", http.FileServer(http.Dir("./../frontend")))
	}
	// start server
	go http.ListenAndServe(addr, nil)
}

func newRandomMobEntity(mobList []*mobs.MobDefinition, rnd *rand.Rand, radius float32) model.MobEntity {
	choices := []wrand.Choice{}
	for _, m := range mobList {
		choices = append(choices, wrand.Choice{Weight: m.Generator.Weight, Choice: m})
	}
	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(*mobs.MobDefinition)

	m := mob.NewMob(selected)
	x := newRandomCoordinate(radius)
	y := newRandomCoordinate(radius)
	for (x * x + y * y > radius * radius) {
		x = newRandomCoordinate(radius)
		y = newRandomCoordinate(radius)
	}
	m.SetPosition(phy.Vec2f{float32(x), float32(y)})

	return m
}

func newRandomCoordinate(radius float32) float32 {
    return rand.Float32()*2*radius - radius
}