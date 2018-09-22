package main

import (
	"context"
	"fmt"
	"github.com/trichner/berryhunter/chieftain/framer"
	"testing"
)

func TestListenTls(t *testing.T) {
	ListenTls("127.0.0.1:3443", "server.crt", "server.key", func(ctx context.Context, f framer.Framer) error {
		for {
			msg, err := f.ReadMessage()

			if err != nil {
				return err
			}

			fmt.Printf("MSG: %s\n" , string(msg))

			if err := f.WriteMessage(msg); err!=nil {
				return err
			}

		}
	})
}

