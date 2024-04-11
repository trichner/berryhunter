package server

// Read here: https://github.com/denji/golang-tls

import (
	"context"
	"crypto/tls"
	"github.com/trichner/berryhunter/pkg/chieftain/dao"
	"github.com/trichner/berryhunter/pkg/chieftain/framer"
	"io"
	"log"
)

type Server struct {
	store     dao.DataStore
	playerDao dao.PlayerDao
}

func NewServer(store dao.DataStore, playerDao dao.PlayerDao) (*Server, error) {
	return &Server{
		store:     store,
		playerDao: playerDao,
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
		log.Printf("client connected %s", conn.RemoteAddr())
		go func() {
			err := HandleConn(srv.store, srv.playerDao, conn)
			if err == io.EOF {
				log.Printf("client disconnected %s", conn.RemoteAddr())
			} else if err != nil {
				log.Println(err)
			}
		}()
	}
}
