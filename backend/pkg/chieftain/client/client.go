package client

// Read here: https://github.com/denji/golang-tls

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io"
	"log"
	"log/slog"
	"os"

	"github.com/trichner/berryhunter/pkg/chieftain/framer"
)

type Config struct {
	Addr string

	CACertFile     string
	ClientCertFile string
	ClientKeyFile  string
}

type Client struct {
	tx   chan *Scoreboard
	done chan struct{}
}

type Conn interface {
	io.ReadWriteCloser
}

type Dialer func() (Conn, error)

func Connect(config *Config) (*Client, error) {
	caPool := x509.NewCertPool()
	ca, err := os.ReadFile(config.CACertFile)
	if err != nil {
		return nil, fmt.Errorf("failed to load ca cert file: %w", err)
	}

	ok := caPool.AppendCertsFromPEM(ca)
	if !ok {
		return nil, fmt.Errorf("failed to add trust root: %s", config.CACertFile)
	}

	clientCert, err := tls.LoadX509KeyPair(config.ClientCertFile, config.ClientKeyFile)
	if err != nil {
		return nil, fmt.Errorf("failed to load client certificate: %w", err)
	}

	conf := &tls.Config{
		Certificates: []tls.Certificate{clientCert},
		RootCAs:      caPool,
	}

	d := func() (Conn, error) {
		return tls.Dial("tcp", config.Addr, conf)
	}
	return ConnectWithDialer(d)
}

func ConnectWithDialer(d Dialer) (*Client, error) {
	c := &Client{
		tx:   make(chan *Scoreboard, 128),
		done: make(chan struct{}),
	}

	go func() {
		connect(d, func(f framer.Framer) error {
			// write pump
			for {
				msg, ok := <-c.tx
				if !ok {
					return nil
				}
				if err := f.WriteMessage(ScoreBoardMarshal(msg)); err != nil {
					return err
				}
			}

			return nil
		})
		close(c.done)
	}()

	return c, nil
}

func (c *Client) Write(s *Scoreboard) {
	if s == nil {
		slog.Debug("'nil' scoreboard, skipping chieftain update")
		return
	}
	slog.Debug("sending scoreboard to chieftain")
	c.tx <- s
}

// Close closes the connection, may panic if already closed!
func (c *Client) Close() error {
	slog.Debug("closing chieftain client")
	close(c.tx)
	<-c.done
	return nil
}

type frameHandler func(f framer.Framer) error

func connect(d Dialer, fh frameHandler) {
	conn, err := d()
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	f, err := framer.NewFramer(conn)
	if err != nil {
		log.Fatal(err)
	}

	fh(f)
	if err != nil {
		log.Fatal(err)
	}
}
