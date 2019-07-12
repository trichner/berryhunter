package client

// Read here: https://github.com/denji/golang-tls

import (
	"crypto/tls"
	"github.com/trichner/berryhunter/chieftaind/framer"
	"io"
	"log"
)

type Client struct {
	tx   chan *Scoreboard
	done chan struct{}
}

type Conn interface {
	io.ReadWriteCloser
}

type Dialer func() (Conn, error)

func Connect(addr string) (ScoreboardUpdateClient, error) {

	conf := &tls.Config{
		//TODO(Thomas) for debugging...
		InsecureSkipVerify: true,
	}

	d := func() (Conn, error) {
		return tls.Dial("tcp", addr, conf)
	}
	return ConnectWithDialer(d)
}

func ConnectWithDialer(d Dialer) (ScoreboardUpdateClient, error) {

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
	c.tx <- s
}

// Close closes the connection, may panic if already closed!
func (c *Client) Close() error {
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
