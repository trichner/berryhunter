package client

import (
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"log"
	"github.com/trichner/berryhunter/backend/codec"
)

var _ = model.Client(&client{})

type client struct {
	c      *net.Client
	joins  chan *model.Join
	inputs chan *model.PlayerInput
}

func (c *client) NextInput() *model.PlayerInput {
	select {
	case msg := <-c.inputs:
		return msg
	default:
	}
	return nil
}

func (c *client) NextJoin() *model.Join {
	select {
	case msg := <-c.joins:
		return msg
	default:
	}
	return nil
}

func (c *client) OnDisconnect(h func(model.Client)) {
	c.c.OnDisconnect(func(o *net.Client) {
		h(c)

		//TODO channel leak
		close(c.inputs)
		close(c.joins)
	})
}

func (c *client) SendMessage(bytes []byte) error {
	return c.c.SendMessage(bytes)
}

func NewClient(c *net.Client) model.Client {
	newClient := &client{
		c:      c,
		inputs: make(chan *model.PlayerInput, 2),
		joins:  make(chan *model.Join, 2),
	}

	c.OnMessage(func(client *net.Client, bytes []byte) {
		msg := codec.ClientMessageFlatbufferUnmarshal(bytes)
		switch msg.BodyType() {
		case BerryhunterApi.ClientMessageBodyInput:
			i := codec.InputMessageFlatbufferUnmarshal(msg)
			// push input if possible, drop if overflow
			select {
			case newClient.inputs <- i:
			default:
				log.Print("Input dropped.")
			}
		case BerryhunterApi.ClientMessageBodyJoin:
			j := codec.JoinMessageFlatbufferUnmarshal(msg)
			newClient.joins <- j
		}
	})
	return newClient
}
