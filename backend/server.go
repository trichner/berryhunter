package main

import (
	"log"
	"net/http"

	"golang.org/x/net/websocket"
)

type Message struct {
	body string
}

// Chat server.
type Server struct {
	pattern              string
	rxCh                 chan *ClientMessage
	doneCh               chan bool
	clientConnectHandler ClientConnectHandler
}

type ClientMessage struct {
	client *Client
	body   *Message
}

// Create new chat server.
func NewServer(pattern string, handler ClientConnectHandler) *Server {
	rxCh := make(chan *ClientMessage)
	doneCh := make(chan bool)

	return &Server{
		pattern:              pattern,
		rxCh:                 rxCh,
		doneCh:               doneCh,
		clientConnectHandler: handler,
	}
}

type ClientConnectHandler func(client *Client)

// Listen and serve.
// It serves client connection and broadcast request.
func (s *Server) Listen() {

	log.Println("Listening server...")

	// websocket handler
	onConnected := func(ws *websocket.Conn) {
		log.Println("New connection.")
		// add player
		client := NewClient(ws, s.rxCh)
		s.clientConnectHandler(client)
		client.Listen()
	}

	http.Handle(s.pattern, websocket.Handler(onConnected))
}
