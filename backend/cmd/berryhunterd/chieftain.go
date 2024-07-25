package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path"
	"path/filepath"

	"github.com/trichner/berryhunter/pkg/chieftain/api"
	"github.com/trichner/berryhunter/pkg/chieftain/dao"
	"github.com/trichner/berryhunter/pkg/chieftain/db"
	"github.com/trichner/berryhunter/pkg/chieftain/server"
	"github.com/trichner/berryhunter/pkg/chieftain/server/cert"
	"github.com/trichner/berryhunter/pkg/chieftain/service"
	"golang.org/x/sync/errgroup"
)

type ChieftainServer struct {
	db           dao.DataStore
	scoreService service.ScoreService
	server       *server.Server

	Certificates *cert.Bundle
	ScoreHandler http.Handler
}

func (c *ChieftainServer) Close() error {
	if err := c.server.Close(); err != nil {
		slog.Error("error closing chieftain server", slog.Any("error", err))
	}

	if err := c.db.Close(); err != nil {
		slog.Error("error closing chieftain db", slog.Any("error", err))
	}

	return nil
}

func bootChieftain(dir string, port int) (*ChieftainServer, error) {
	dataStore, err := db.New(path.Join(dir, "chieftain.db"))
	if err != nil {
		return nil, err
	}

	playerStore, err := dao.NewPlayerDao(dataStore)
	if err != nil {
		return nil, err
	}

	scoreService, err := service.NewScoreService(playerStore)
	if err != nil {
		return nil, err
	}

	wg := new(errgroup.Group)

	// boot TLS server
	s, err := server.NewServer(dataStore, playerStore)
	if err != nil {
		return nil, err
	}

	addr := fmt.Sprintf("127.0.0.1:%d", port)
	slog.Info("chieftain listening", slog.String("addr", addr))

	bundle, err := loadOrGenerateCertificates(dir)
	if err != nil {
		return nil, fmt.Errorf("failed to load or create certificates: %w", err)
	}

	wg.Go(func() error {
		return s.ListenTls(addr, &server.CertBundle{
			CACertFile:     bundle.CACertFile,
			ServerCertFile: bundle.ServerCertFile,
			ServerKeyFile:  bundle.ServerKeyFile,
		})
	})

	handler := api.NewRouter(dataStore, scoreService)

	return &ChieftainServer{
		db:           dataStore,
		scoreService: scoreService,
		server:       s,
		Certificates: bundle,
		ScoreHandler: handler,
	}, nil
}

func loadOrGenerateCertificates(dir string) (*cert.Bundle, error) {
	const caCertFileName = "ca_cert.pem"
	const caKeyFileName = "ca_key.pem"

	const serverCertFileName = "server_cert.pem"
	const serverKeyFileName = "server_key.pem"

	const clientCertFileName = "client_cert.pem"
	const clientKeyFileName = "client_key.pem"

	caCertFile := filepath.Join(dir, caCertFileName)
	_, err := os.Stat(caCertFile)
	if os.IsNotExist(err) {
		slog.Info("ca cert not found, generating new certificates", slog.String("filename", caCertFile))
		return cert.GenerateServerCertificate(dir, []string{"localhost"}, []string{"127.0.0.1"})
	}

	slog.Info("ca cert found, assuming other certs also exist", slog.String("filename", caCertFile))
	return &cert.Bundle{
		CACertFile:     caCertFile,
		CAKeyFile:      filepath.Join(dir, caKeyFileName),
		ServerCertFile: filepath.Join(dir, serverCertFileName),
		ServerKeyFile:  filepath.Join(dir, serverKeyFileName),
		ClientCertFile: filepath.Join(dir, clientCertFileName),
		ClientKeyFile:  filepath.Join(dir, clientKeyFileName),
	}, nil
}
