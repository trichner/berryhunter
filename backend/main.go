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

	var radius float32 = 20
	g := core.NewGame(config, registry, mobs, tokens, radius)

	rnd := rand.New(rand.NewSource(0xDEADBEEF))
	entities := gen.Generate(g.Items(), rnd, radius)
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

func newMobEntity(def *mobs.MobDefinition) model.MobEntity {
	circle := phy.NewCircle(phy.VEC2F_ZERO, 0.5)
	circle.Shape().Layer = model.LayerViewportCollision | model.LayerActionCollision
	circle.Shape().Mask = model.LayerMobStaticCollision | model.LayerBorderCollision
	return mob.NewMob(circle, def)
}
