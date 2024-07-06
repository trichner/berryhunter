package cert

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/alecthomas/assert/v2"
)

// TestCert_Http generates mTLS certificates, boots an HTTP server and does a trivial HTTP request to it
func TestCert_Http(t *testing.T) {
	bundle, err := GenerateServerCertificate([]string{"dev.berryhunter.io"}, []string{"127.0.0.1"})
	assert.NoError(t, err)

	caPool := x509.NewCertPool()
	ca, err := os.ReadFile(bundle.CACertFile)
	assert.NoError(t, err)

	caPool.AppendCertsFromPEM(ca)

	serverCert, err := tls.LoadX509KeyPair(bundle.ServerCertFile, bundle.ServerKeyFile)
	assert.NoError(t, err)

	serverTlsConfig := &tls.Config{
		Certificates: []tls.Certificate{serverCert},
		ClientCAs:    caPool,
		MinVersion:   tls.VersionTLS13,
		ClientAuth:   tls.RequireAndVerifyClientCert,
	}

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	assert.NoError(t, err)
	defer listener.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})

	port := listener.Addr().(*net.TCPAddr).Port

	srv := &http.Server{
		Addr:      fmt.Sprintf("127.0.0.1:%d", port),
		Handler:   mux,
		TLSConfig: serverTlsConfig,
	}

	go func() {
		err = srv.ServeTLS(listener, "", "")
		if errors.Is(err, http.ErrServerClosed) {
			return
		}
		assert.NoError(t, err)
	}()

	clientCert, err := tls.LoadX509KeyPair(bundle.ClientCertFile, bundle.ClientKeyFile)
	clientConfig := &tls.Config{
		Certificates: []tls.Certificate{clientCert},
		RootCAs:      caPool,
	}
	transport := &http.Transport{
		TLSClientConfig: clientConfig,
	}
	client := &http.Client{Transport: transport, Timeout: time.Second}

	url := fmt.Sprintf("https://127.0.0.1:%d", port)

	// when
	res, err := client.Get(url)
	assert.NoError(t, err)

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return
	}

	// then
	assert.Equal(t, 204, res.StatusCode, string(body))

	ctx, _ := context.WithTimeout(context.Background(), time.Second*2)
	srv.Shutdown(ctx)
}
