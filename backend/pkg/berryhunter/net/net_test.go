package net

import (
	"fmt"
	"log"
	"net/http"
	"testing"
	"time"
)

func OnConnected(c *Client) {
	fmt.Printf("Connected!\n")
	ticker := time.NewTicker(time.Second)
	go func() {
		for {
			c.SendMessage([]byte("Ping!"))
			<-ticker.C
		}
	}()
	c.OnMessage(func(c *Client, msg []byte) {
		fmt.Printf("Message: %s", string(msg))
	})
	c.OnDisconnect(func(c *Client) {
		fmt.Printf("Disconnected.")
	})
}

func TestClient_Run(t *testing.T) {
	http.HandleFunc("/ws", NewHandleFunc(OnConnected))

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
