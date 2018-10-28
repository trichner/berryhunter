package net

// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import (
	"bytes"
	"errors"
	"github.com/gorilla/websocket"
	"log"
	"time"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// Buffered channel of inbound messages.
	receive chan []byte

	quit chan struct{}

	// Handler notified on events
	onConnectedHandler    func(*Client)
	onDisconnectedHandler func(*Client)
	onMessageHandler      func(*Client, []byte)
}

func (c *Client) Close() {
	c.conn.Close()
}

func (c *Client) OnMessage(h func(*Client, []byte)) {
	c.onMessageHandler = h
}

func (c *Client) OnDisconnect(h func(*Client)) {
	c.onDisconnectedHandler = h
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		// close the pipe
		close(c.send)
		close(c.receive)
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		messageType, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}
		if messageType == websocket.TextMessage {
			message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		}
		c.receive <- message
	}
}

// Run loops until the client is done
func (c *Client) Run() {
	go c.writePump()
	go c.readPump()
	c.onConnectedHandler(c)
	defer func() {
		if c.onDisconnectedHandler != nil {
			c.onDisconnectedHandler(c)
		}
	}()
	for {
		select {
		case msg, ok := <-c.receive:
			if !ok {
				// receive channel was closed
				return
			}
			if c.onMessageHandler != nil {
				c.onMessageHandler(c, msg)
			}
		}
	}
}

// SendMessage sends a message to this client
func (c *Client) SendMessage(msg []byte) error {
	// is channel already closed?
	select {
	case <-c.quit:
		return errors.New("IllegalState: Write pipe closed.")
	default:

	}

	select {
	case c.send <- msg:
		return nil
	default:
	}
	return errors.New("IllegalState: Write pipe closed.")
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		close(c.quit)
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.BinaryMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}
