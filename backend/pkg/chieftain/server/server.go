package server

// Read here: https://github.com/denji/golang-tls

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"io"
	"log"
	"log/slog"
	"os"

	"github.com/trichner/berryhunter/pkg/chieftain/dao"
	"github.com/trichner/berryhunter/pkg/chieftain/framer"
)

type CertBundle struct {
	CACertFile string

	ServerCertFile string
	ServerKeyFile  string
}

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

func (srv *Server) ListenTls(laddr string, certs *CertBundle) error {
	caPool := x509.NewCertPool()
	caCert, err := os.ReadFile(certs.CACertFile)
	if err != nil {
		return err
	}
	if ok := caPool.AppendCertsFromPEM(caCert); !ok {
		return fmt.Errorf("failed to load %s into certpool", certs.CACertFile)
	}

	serverCert, err := tls.LoadX509KeyPair(certs.ServerCertFile, certs.ServerKeyFile)
	if err != nil {
		return err
	}

	config := &tls.Config{
		Certificates: []tls.Certificate{serverCert},
		ClientCAs:    caPool,
		ClientAuth:   tls.RequireAndVerifyClientCert,
	}
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
		slog.Info("client connected", slog.String("remote", conn.RemoteAddr().String()))
		go func() {
			err := HandleConn(srv.store, srv.playerDao, conn)
			if errors.Is(err, io.EOF) {
				slog.Info("client disconnected", slog.String("remote", conn.RemoteAddr().String()))
			} else if err != nil {
				slog.Error("client error", slog.Any("error", err))
			}
		}()
	}
}
