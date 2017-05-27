package net

import (
	"testing"
	"net/http"
	"log"
	"fmt"
	"time"
)

type handler struct{}

func (h *handler) OnConnected(c *Client) {
	fmt.Printf("Connected!\n")
	ticker := time.NewTicker(time.Second)
	go func() {
		for {
			c.SendMessage([]byte("Ping!"))
			<-ticker.C
		}
	}()
}

func (h *handler) OnDisconnected(c *Client) {
	fmt.Printf("Disconnected!\n")
}

func (h *handler) OnMessage(c *Client, msg []byte) {
	fmt.Printf("Message: %s\n", string(msg))
}

func TestClient_Run(t *testing.T) {

	http.HandleFunc("/ws", WsHandleFunc(&handler{}))

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
