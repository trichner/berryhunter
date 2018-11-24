package main

import (
	"github.com/trichner/berryhunter/chieftaind/api"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/chieftaind/server"
	"github.com/trichner/berryhunter/chieftaind/service"
	"log"
	"net/http"
	"sync"
)

func main() {

	log.Printf("booting chieftain")

	playerStore, err := dao.NewPlayerDao()
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}

	dataStore, err := dao.NewDataStore()
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

	addr := ":3443"
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

	apiAddr := ":3080"
	log.Printf("api listening on %s/scoreboard", apiAddr)
	go func() {
		r := api.NewRouter(dataStore, scoreService)
		err := http.ListenAndServe(apiAddr, r)
		if err != nil {
			log.Fatalf("cannot boot api: %s", err)
		}
	}()

	log.Printf("boot successful, all systems nominal")
	wg.Wait()
}
