package main

import (
	"flag"
	"log"
	"log/slog"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
)

var addr = flag.String("addr", "localhost:2000", "http service address")

func main() {
	flag.Parse()
	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u := url.URL{Scheme: "ws", Host: *addr, Path: "/game"}
	// u := url.URL{Scheme: "wss", Host: "dev.berryhunter.io", Path: "/game"}
	log.Printf("connecting to %s", u.String())

	dialer := &websocket.Dialer{
		HandshakeTimeout: time.Second * 3,
	}

	c, _, err := dialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	done := make(chan struct{})

	go func() {
		defer close(done)
		for {
			mt, message, err := c.ReadMessage()
			if err != nil {
				slog.Error("read", slog.Any("error", err))
				return
			}
			slog.Info("rx message", slog.String("type", formatWebsocketMessageType(mt)), slog.Any("len", len(message)))

			msg := BerryhunterApi.GetRootAsServerMessage(message, 0)
			logServerMessage(msg)
		}
	}()

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			log.Printf("tik")
			//err := c.WriteMessage(websocket.TextMessage, []byte(t.String()))
			//if err != nil {
			//	log.Println("write:", err)
			//	return
			//}
		case <-interrupt:
			log.Println("interrupt")

			// Cleanly close the connection by sending a close message and then
			// waiting (with timeout) for the server to close the connection.
			err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return
		}
	}
}

func logServerMessage(msg *BerryhunterApi.ServerMessage) {
	slog.Info("server message", slog.String("type", BerryhunterApi.EnumNamesServerMessageBody[msg.BodyType()]))
}

func formatWebsocketMessageType(t int) string {
	switch t {
	case websocket.TextMessage:
		return "text"
	case websocket.BinaryMessage:
		return "binary"
	case websocket.PingMessage:
		return "ping"
	case websocket.CloseMessage:
		return "close"
	case websocket.PongMessage:
		return "pong"
	default:
		return "unknown"
	}
}
