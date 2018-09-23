package server

// Read here: https://github.com/denji/golang-tls

import (
	"context"
	"crypto/tls"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/chieftaind/framer"
	"log"
)

type Server struct {
	store dao.DataStore
	playerDao dao.PlayerDao
}

func NewServer(store dao.DataStore, playerDao dao.PlayerDao) (*Server, error){
	return &Server{
		store:store,
		playerDao:playerDao,
	}, nil
}

type FrameHandler func(ctx context.Context, f framer.Framer) error

func (srv *Server) ListenTls(laddr, certFile, keyFile string) error {

	cer, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		return err
	}

	config := &tls.Config{Certificates: []tls.Certificate{cer}}
	ln, err := tls.Listen("tcp", laddr, config)
	if err != nil {
		return err
	}
	defer ln.Close()

	for {
		conn, err := ln.Accept()
		if err != nil {
			log.Println(err)
			continue
		}
		go func() {
			err := HandleConn(srv.store, srv.playerDao, conn)
			if err != nil {
				log.Println(err)
			}
		}()
	}
}

