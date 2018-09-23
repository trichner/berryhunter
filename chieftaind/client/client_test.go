package client

import (
	"context"
	"github.com/trichner/berryhunter/chieftaind/framer"
	"log"
)

func main() {

	connect(context.Background(), "127.0.0.1:3443", func(ctx context.Context, f framer.Framer) error {

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
