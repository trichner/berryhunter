package main

import (
	"log"
	"net/http"

	"golang.org/x/net/websocket"
	"errors"
	"fmt"
)


type Message struct {
	body string
}

// Chat server.
type Server struct {
	pattern   string
	clients   map[int]*Client
	addCh     chan *Client
	delCh     chan *Client
	txCh	  chan *Message
	rxCh	  chan *ClientMessage
	doneCh    chan bool
	errCh     chan error
}

type ClientMessage struct {
	client *Client
	body *Message
}


// Create new chat server.
func NewServer(pattern string) *Server {
	clients := make(map[int]*Client)
	addCh := make(chan *Client)
	delCh := make(chan *Client)
	txCh := make(chan *Message)
	rxCh := make(chan *ClientMessage)
	doneCh := make(chan bool)
	errCh := make(chan error)

	return &Server{
		pattern,
		clients,
		addCh,
		delCh,
		txCh,
		rxCh,
		doneCh,
		errCh,
	}
}

func (s *Server) Add(c *Client) {
	s.addCh <- c
}

func (s *Server) Del(c *Client) {
	s.delCh <- c
}

func (s *Server) Broadcast(msg *Message) {
	s.txCh <- msg
}

func (s *Server) Done() {
	s.doneCh <- true
}

func (s *Server) Err(err error) {
	s.errCh <- err
}

func (s *Server) Tx(clientId int, msg *Message){
	c, ok := s.clients[clientId]
	if(!ok){
		errMsg := fmt.Sprintf("Client %d not found", clientId)
		s.errCh <- errors.New(errMsg)
		return
	}
	c.Tx(msg)
}

func (s *Server) Rx(msg *ClientMessage){
	s.rxCh <- msg
}

func (s *Server) sendAll(msg *Message) {
	for _, c := range s.clients {
		c.Tx(msg)
	}
}

// Listen and serve.
// It serves client connection and broadcast request.
func (s *Server) Listen() {

	log.Println("Listening server...")

	// websocket handler
	onConnected := func(ws *websocket.Conn) {
		log.Println("New connection.")
		defer func() {
			err := ws.Close()
			if err != nil {
				s.errCh <- err
			}
		}()

		client := NewClient(ws, s)
		s.Add(client)
		client.Listen()
	}

	http.Handle(s.pattern, websocket.Handler(onConnected))
	log.Println("Created handler")

	for {
		select {

		// Add new a client
		case c := <-s.addCh:
			log.Println("Added new client")
			s.clients[c.id] = c
			log.Println("Now", len(s.clients), "clients connected.")

			// del a client
		case c := <-s.delCh:
			log.Println("Delete client")
			delete(s.clients, c.id)

			// broadcast message for all clients
		case msg := <-s.txCh:
			log.Println("Send all:", msg)
			s.sendAll(msg)

		case err := <-s.errCh:
			log.Println("Error:", err.Error())

		case <-s.doneCh:
			return
		}
	}
}