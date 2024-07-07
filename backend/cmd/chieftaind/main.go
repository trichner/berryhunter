package main

import (
	_ "embed"
	"fmt"
	"github.com/trichner/berryhunter/pkg/chieftain/db"
	"log"
	"log/slog"
	"net/http"
	"os"
	"path"
	"strings"

	"golang.org/x/sync/errgroup"

	"github.com/trichner/berryhunter/pkg/chieftain/api"
	"github.com/trichner/berryhunter/pkg/chieftain/cfg"
	"github.com/trichner/berryhunter/pkg/chieftain/dao"
	"github.com/trichner/berryhunter/pkg/chieftain/server"
	"github.com/trichner/berryhunter/pkg/chieftain/service"
	"github.com/trichner/berryhunter/pkg/logging"
)

//go:embed conf.default.json
var defaultConfig []byte

func main() {
	logging.SetupLogging()

	slog.Info("booting chieftain")
	config := loadConf()

	dataStore, err := db.New(path.Join(config.DataDir, "chieftain.db"))
	if err != nil {
		slog.Error("cannot boot chieftain", slog.Any("error", err))
		panic(err)
	}

	playerStore, err := dao.NewPlayerDao(dataStore)
	if err != nil {
		slog.Error("cannot boot chieftain", slog.Any("error", err))
		panic(err)
	}

	scoreService, err := service.NewScoreService(playerStore)
	if err != nil {
		slog.Error("cannot boot chieftain", slog.Any("error", err))
		panic(err)
	}

	wg := new(errgroup.Group)

	// boot TLS server
	s, err := server.NewServer(dataStore, playerStore)
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}

	addr := config.ApiAddr
	slog.Info("chieftain listening", slog.String("addr", addr))

	// TODO make configurable
	bundle := &server.CertBundle{
		CACertFile:     "ca_cert.pem",
		ServerCertFile: "server_cert.pem",
		ServerKeyFile:  "server_key.pem",
	}

	wg.Go(func() error {
		return s.ListenTls(addr, bundle)
	})

	// boot HTTP server
	restAddr := config.RestAddr
	slog.Info("rest api listening", slog.String("url", fmt.Sprintf("%s/scoreboard", restAddr)))
	wg.Go(func() error {
		r := api.NewRouter(dataStore, scoreService)
		return http.ListenAndServe(restAddr, r)
	})

	slog.Info("chieftain booted, all systems nominal")
	err = wg.Wait()
	if err != nil {
		slog.Error("chieftain crashed", slog.Any("error", err))
		panic(err)
	}
}

func loadConf() *cfg.Config {
	configFile := strings.TrimSpace(os.Getenv("CHIEFTAIND_CONF"))
	if configFile == "" {
		configFile = "./conf.json"
	}

	_, err := os.Stat(configFile)
	if os.IsNotExist(err) {
		err := os.WriteFile(configFile, defaultConfig, 0644)
		if err != nil {
			panic(err)
		}
	}

	config, err := cfg.ReadConfig(configFile)
	if err != nil {
		log.Panicf("Cannot read config '%s':%v", configFile, err)
	}
	return config
}
