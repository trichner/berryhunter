package main

import (
	"errors"
	"golang.org/x/net/websocket"
	"io"
	"sync"
	"sync/atomic"
)

const channelBufSize = 100

var maxId uint64 = 0

// Chat client.
type Client struct {
	id   uint64
	ws   *websocket.Conn
	txCh chan *Message
	rxCh chan<- *ClientMessage

	done int32
	wg   sync.WaitGroup
}

// Create new chat client. Not threadsafe.
func NewClient(ws *websocket.Conn, rxCh chan<- *ClientMessage) *Client {

	if ws == nil {
		panic("ws cannot be nil")
	}

	maxId++
	txCh := make(chan *Message, channelBufSize)

	return &Client{id: maxId, ws: ws, rxCh: rxCh, txCh: txCh}
}

func (c *Client) Tx(msg *Message) error {
	if c.isDone() {
		return errors.New("Client already disconnected.")
	}
	c.txCh <- msg
	return nil
}

func (c *Client) Close() {
	atomic.StoreInt32(&c.done, 1)
	c.ws.Close()
}

func (c *Client) isDone() bool {
	return atomic.LoadInt32(&c.done) > 0
}

// Listen Write and Read request via chanel
func (c *Client) Listen() {

	// TX
	c.wg.Add(1)
	go func() {
		defer func() {
			close(c.txCh)
			c.wg.Done()
		}()
		for !c.isDone() {
			select {
			case msg, ok := <-c.txCh:
				err := websocket.Message.Send(c.ws, msg.body)
				if err != nil || !ok {
					c.Close()
				}
			default:
			}
		}
	}()

	// RX
	c.wg.Add(1)
	go func() {
		defer func() {
			c.wg.Done()
		}()
		for !c.isDone() {
			//var msg Message
			var msg string

			// does this exit cleanly?
			err := websocket.Message.Receive(c.ws, &msg)
			if err == io.EOF || err != nil {
				c.Close()
			} else {
				// push received message into RX queue
				c.rxCh <- &ClientMessage{client: c, body: &Message{msg}}
			}
		}
	}()

	c.wg.Wait()
}
