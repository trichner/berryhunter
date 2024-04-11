package main

import (
	"flag"
	"fmt"
	"github.com/lmittmann/tint"
	"github.com/trichner/berryhunter/pkg/berryhunter/core"
	"github.com/trichner/berryhunter/pkg/berryhunter/gen"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/mob"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
	"github.com/trichner/berryhunter/pkg/berryhunter/wrand"
	"log"
	"log/slog"
	"math/rand"
	"net/http"
	"os"
	"time"
)

func main() {

	slog.SetDefault(slog.New(
		tint.NewHandler(os.Stderr, &tint.Options{
			Level:      slog.LevelDebug,
			TimeFormat: time.TimeOnly,
		}),
	))

	config := loadConf()
	registry := loadItems("../api/items/")
	mobs := loadMobs(registry, "../api/mobs/")

	tokens := loadTokens("./tokens.list")
	log.Printf("👮‍♀️ Read %d tokens.", len(tokens))

	// new game
	var radius float32 = 20
	// For different seeds see:
	// https://docs.google.com/spreadsheets/d/13EbpERJ05GpjUUXOp2zU4Od2FGqymeMV0F278_eBIcQ/edit#gid=0
	var seed int64 = 0xDEADBEEF + 4
	rnd := rand.New(rand.NewSource(seed))
	g, err := core.NewGameWith(
		rnd.Int63(),
		core.Config(config),
		core.Registries(registry, mobs),
		core.Tokens(tokens),
		core.Radius(radius),
	)
	if err != nil {
		panic(err)
	}

	// populate game
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

func bootServer(h http.Handler, port int, path string, dev bool) {

	slog.Info("🦄 Booting game-server", slog.String("addr", fmt.Sprintf(":%d%s", port, path)))
	addr := fmt.Sprintf(":%d", port)
	http.Handle(path, h)

	if dev {
		slog.Info("🔥 dev server running", slog.String("url", fmt.Sprintf("http://localhost:%d?wsUrl=ws://localhost:%d/game", port, port)))
		http.Handle("/", http.FileServer(http.Dir("./../frontend/dist")))
	} else {
		// 'ping' endpoint for liveness probe
		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(204)
		})
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
	for x*x+y*y > radius*radius {
		x = newRandomCoordinate(radius)
		y = newRandomCoordinate(radius)
	}
	m.SetPosition(phy.Vec2f{float32(x), float32(y)})

	return m
}

func newRandomCoordinate(radius float32) float32 {
	return rand.Float32()*2*radius - radius
}
