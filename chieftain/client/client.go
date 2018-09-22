package main

// Read here: https://github.com/denji/golang-tls

import (
	"context"
	"github.com/trichner/berryhunter/chieftain/framer"
	"log"
	"crypto/tls"
)

type FrameHandler func(ctx context.Context, f framer.Framer) error

func main(){

	Dial("127.0.0.1:3443", func(ctx context.Context, f framer.Framer) error {

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

func Dial(addr string,  fh FrameHandler) {

	conf := &tls.Config{
		//TODO(Thomas) for debugging...
		InsecureSkipVerify: true,
	}

	conn, err := tls.Dial("tcp", addr, conf)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	f, err := framer.NewFramer(conn)
	if err != nil {
		log.Fatal(err)
	}

	fh(context.Background(), f)
	if err != nil {
		log.Fatal(err)
	}

}
