package main

import (
	"github.com/trichner/berryhunter/chieftaind/api"
	"github.com/trichner/berryhunter/chieftaind/cfg"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/chieftaind/server"
	"log"
	"net/http"
	"sync"
)

func main() {

	log.Printf("booting chieftain")

	confFile := "conf.json"
	log.Printf("loading configuration from : %s", confFile)
	config, err := cfg.ReadConfig(confFile)
	if err != nil {
		log.Fatalf("cannot read config: %s", err)
	}

	playerStore, err := dao.NewPlayerDao()
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}

	dataStore, err := dao.NewDataStore(config.DataDir + "/chieftain.db")
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
		r := api.NewRouter(dataStore, playerStore)
		err := http.ListenAndServe(restAddr, r)
		if err != nil {
			log.Fatalf("cannot boot api: %s", err)
		}
	}()

	log.Printf("boot successful, all systems nominal")
	wg.Wait()
}
