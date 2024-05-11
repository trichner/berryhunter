package wsock

import (
	"errors"
	"fmt"
	"github.com/gorilla/websocket"
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
	maxMessageSize = 32
)

type MessageType int

const (
	TextMessage   = MessageType(websocket.TextMessage)
	BinaryMessage = MessageType(websocket.BinaryMessage)
	PingMessage   = MessageType(websocket.PingMessage)
	PongMessage   = MessageType(websocket.PongMessage)
	CloseMessage  = MessageType(websocket.CloseMessage)
)

type Message struct {
	mtype MessageType
	body  []byte
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	tx chan *websocket.PreparedMessage

	// Buffered channel of inbound messages.
	rx chan *Message

	quit chan struct{}
}

func UpgradeClient(conn *websocket.Conn) *Client {

	client := &Client{
		conn: conn,
		tx:   make(chan *websocket.PreparedMessage, 256),
		rx:   make(chan *Message, 256),
		quit: make(chan struct{}, 1),
	}

	go client.writePump()
	go client.readPump()
	return client
}

func (c *Client) Close() (error) {

	c.conn.WriteMessage(websocket.CloseMessage, []byte{})
	return c.conn.Close()
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() error {
	defer func() {
		// close the pipe
		close(c.tx)
		close(c.rx)
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		messageType, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				return err
			}
			// normally closed, no error
			return nil
		}
		c.rx <- &Message{MessageType(messageType), message}
	}
}

func (c *Client) ReadMessage() (*Message, error) {

	msg, ok := <-c.rx
	if !ok {
		// rx channel was closed
		return nil, fmt.Errorf("connection is dead")
	}
	return msg, nil
}

func (c *Client) WriteMessage(t MessageType, m []byte) error {

	pm, err := websocket.NewPreparedMessage(int(t), m)
	if err!= nil {
		return err
	}
	return c.WritePreparedMessage(pm)
}

// SendMessage sends a message to this client
func (c *Client) WritePreparedMessage(m *websocket.PreparedMessage) error {
	// is channel already closed?
	select {
	case <-c.quit:
		// not sure, do we need this?
		return errors.New("illegalState: write pipe closed")
	default:
	}

	select {
	case c.tx <- m:
		return nil
	default:
	}
	return errors.New("illegalState: write pipe closed")
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() error {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.tx:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return fmt.Errorf("connection closed")
			}

			if err := c.conn.WritePreparedMessage(message); err != nil {
				return err
			}

		case <-ticker.C: //heartbeat keeping the connection alive
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return err
			}
		}
	}
}
