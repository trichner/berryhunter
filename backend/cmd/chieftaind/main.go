package main

import (
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"

	"github.com/trichner/berryhunter/pkg/chieftain/api"
	"github.com/trichner/berryhunter/pkg/chieftain/cfg"
	"github.com/trichner/berryhunter/pkg/chieftain/dao"
	"github.com/trichner/berryhunter/pkg/chieftain/server"
	"github.com/trichner/berryhunter/pkg/chieftain/service"
	"github.com/trichner/berryhunter/pkg/logging"
)

func main() {
	logging.SetupLogging()

	log.Printf("booting chieftain")
	config := loadConf()

	dataStore, err := dao.NewDataStore(path.Join(config.DataDir, "chieftain.db"))
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}

	playerStore, err := dao.NewPlayerDao(dataStore)
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}

	scoreService, err := service.NewScoreService(playerStore)
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}

	var wg sync.WaitGroup

	// boot TLS server
	s, err := server.NewServer(dataStore, playerStore)
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}

	addr := config.ApiAddr
	log.Printf("chieftain listening on %s", addr)

	wg.Add(1)
	go func() {
		err = s.ListenTls(addr, "server.crt", "server.key")
		if err != nil {
			log.Fatalf("cannot boot chieftain: %s", err)
		}
	}()

	// boot HTTP server
	wg.Add(1)

	restAddr := config.RestAddr
	log.Printf("rest api listening on %s/scoreboard", restAddr)
	go func() {
		r := api.NewRouter(dataStore, scoreService)
		err := http.ListenAndServe(restAddr, r)
		if err != nil {
			log.Fatalf("cannot boot api: %s", err)
		}
	}()

	log.Printf("boot successful, all systems nominal")
	wg.Wait()
}

func loadConf() *cfg.Config {
	configFile := strings.TrimSpace(os.Getenv("CHIEFTAIND_CONF"))
	if configFile == "" {
		configFile = "./conf.json"
	}
	config, err := cfg.ReadConfig(configFile)
	if err != nil {
		log.Panicf("Cannot read config '%s':%v", configFile, err)
	}
	return config
}
