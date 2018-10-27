package client

import (
	"crypto/tls"
	"github.com/trichner/berryhunter/chieftaind/framer"
	"log"
	"testing"
)

func test(t *testing.T) {

	const addr = "127.0.0.1:3443"
	conf := &tls.Config{
		//TODO(Thomas) for debugging...
		InsecureSkipVerify: true,
	}

	d := func() (Conn, error) {
		return tls.Dial("tcp", addr, conf)
	}

	connect(d, func(f framer.Framer) error {

		err := f.WriteMessage([]byte("Hello World!"))
		if err != nil {
			return err
		}

		msg, err := f.ReadMessage()
		if err != nil {
			return err
		}
		log.Printf("MSG: %s", string(msg))
		return nil
	})
}
