package main

import (
	"flag"
	"fmt"
	"log"
	"log/slog"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"

	"github.com/trichner/berryhunter/pkg/berryhunter/core"
	"github.com/trichner/berryhunter/pkg/berryhunter/gen"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/mob"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
	"github.com/trichner/berryhunter/pkg/berryhunter/wrand"
	"github.com/trichner/berryhunter/pkg/logging"
	"golang.org/x/crypto/acme/autocert"
)

func main() {
	logging.SetupLogging()

	config := loadConf()
	itemsRegistry := loadItems()
	mobsRegistry := loadMobs(itemsRegistry)

	tokens := loadTokens("./tokens.list")
	slog.Info("👮‍♀️ read tokens", slog.Int("token_count", len(tokens)))

	// new game
	var radius float32 = 20
	// For different seeds see:
	// https://docs.google.com/spreadsheets/d/13EbpERJ05GpjUUXOp2zU4Od2FGqymeMV0F278_eBIcQ/edit#gid=0
	var seed int64 = 0xDEADBEEF + 4
	rnd := rand.New(rand.NewSource(seed))
	g, err := core.NewGameWith(
		rnd.Int63(),
		core.Config(config),
		core.Registries(itemsRegistry, mobsRegistry),
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

	mobList := mobsRegistry.Mobs()

	if len(mobList) > 0 {
		// add some mobsRegistry
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

	if config.Server.TlsHost != "" {
		err := bootTlsServer(g.Handler(), config.Server.Path, config.Server.TlsHost, dev)
		if err != nil {
			log.Fatal(err)
		}
	} else {
		bootServer(g.Handler(), config.Server.Port, config.Server.Path, dev)
	}

	g.Loop()
}

func bootTlsServer(h http.Handler, path string, host string, dev bool) error {
	slog.Info("🦄 Booting TLS game-server", slog.String("addr", fmt.Sprintf("https://%s%s", host, path)), slog.Any("hosts", []string{host}))

	userCacheDir, err := os.UserCacheDir()
	if err != nil {
		return err
	}

	cacheDir := filepath.Join(userCacheDir, "berryhunterd")

	hosts := []string{host}

	slog.Info("🔐 Requesting ACME certificate", slog.Any("hosts", hosts), slog.String("cache_dir", cacheDir))

	m := &autocert.Manager{
		Cache:      autocert.DirCache(cacheDir),
		Prompt:     autocert.AcceptTOS,
		Email:      "dev@berryhunter.io",
		HostPolicy: autocert.HostWhitelist(hosts...),
	}

	mux := http.NewServeMux()

	mux.Handle(path, h)

	if dev {
		slog.Info("🔥 dev server running", slog.String("url", fmt.Sprintf("https://%s?wsUrl=wss://%s%s", host, host, path)))
		mux.Handle("/", frontendHandler())
	} else {
		// 'ping' endpoint
		mux.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
			if req.URL.Path != "/" {
				http.NotFound(w, req)
				return
			}
			w.WriteHeader(http.StatusNoContent)
		})
	}

	s := &http.Server{
		Addr:      ":https",
		TLSConfig: m.TLSConfig(),
		Handler:   mux,
	}

	// start server
	go log.Fatal(s.ListenAndServeTLS("", ""))

	return nil
}

func bootServer(h http.Handler, port int, path string, dev bool) {
	slog.Info("🦄 Booting game-server", slog.String("addr", fmt.Sprintf(":%d%s", port, path)))
	addr := fmt.Sprintf(":%d", port)

	mux := http.NewServeMux()
	mux.Handle(path, h)

	if dev {
		slog.Info("🔥 dev server running", slog.String("url", fmt.Sprintf("http://localhost:%d?wsUrl=ws://localhost:%d/game", port, port)))
		mux.Handle("/", frontendHandler())
	} else {
		// 'ping' endpoint for liveness probe
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/" {
				http.NotFound(w, r)
				return
			}
			w.WriteHeader(204)
		})
	}
	// start server
	go log.Fatal(http.ListenAndServe(addr, mux))
}

func frontendHandler() http.Handler {
	frontendPath, err := filepath.Abs("./../frontend/dist")
	if err != nil {
		log.Fatal(err)
	}
	slog.Info("🕸️ serving frontend", slog.String("path", frontendPath))
	return http.FileServer(http.Dir(frontendPath))
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
