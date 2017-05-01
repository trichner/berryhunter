package main


import (
	"io"
"log"

"golang.org/x/net/websocket"
	"errors"
)

const channelBufSize = 100

var maxId uint64 = 0

// Chat client.
type Client struct {
	id     uint64
	ws     *websocket.Conn
	txCh   chan *Message
	rxCh   chan<- *ClientMessage
	doneCh chan bool
	rxCb   func() (c *Client, m *Message)
}

// Create new chat client. Not threadsafe.
func NewClient(ws *websocket.Conn, rxCh chan<- *ClientMessage) *Client {

	if ws == nil {
		panic("ws cannot be nil")
	}

	maxId++
	//rxCh := make(chan *Message, channelBufSize)
	txCh := make(chan *Message, channelBufSize)
	doneCh := make(chan bool, channelBufSize)

	return &Client{id: maxId, ws: ws, rxCh: rxCh, txCh: txCh, doneCh: doneCh}
}

func (c *Client) Tx(msg *Message) error {

	if c.isDone() {
		return errors.New("Client already disconnected.")
	}
	c.txCh <- msg
	return nil
}

func (c *Client) isDone() bool {
	select {
	case <-c.doneCh:
		return true
	default:
	}

	return false
}

func (c *Client) Close(msg *Message) {
	c.doneCh <- true
	c.ws.Close()
}

// Listen Write and Read request via chanel
func (c *Client) Listen() {

	// TX goroutine
	go func() {
		for {
			if c.isDone() {
				// clean up sender
				close(c.txCh)
				return
			}

			select {
			// send message to the client
			case msg := <-c.txCh:
				log.Println("Send:", msg)
				websocket.Message.Send(c.ws, msg.body)
			default:
			}
		}
	}()

	// RX
	for {
		if c.isDone() {
			// clean up receiver
			return
		}
		//var msg Message
		var msg string
		err := websocket.Message.Receive(c.ws, &msg)
		if err == io.EOF {
			close(c.doneCh)
		} else if err != nil {
			log.Println(err)
		} else {
			c.rxCh <- &ClientMessage{client: c, body: &Message{msg}}
		}
	}
}


