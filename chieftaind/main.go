package main

import (
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/chieftaind/server"
	"log"
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

	s, err := server.NewServer(dataStore, playerStore)
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}

	addr := "127.0.0.1:3443"
	log.Printf("listening on %s", addr)
	err = s.ListenTls(addr, "server.crt", "server.key")
	if err != nil {
		log.Fatalf("cannot boot chieftain: %s", err)
	}
}
