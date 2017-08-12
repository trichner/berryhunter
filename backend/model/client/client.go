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
	cheats chan *model.Cheat
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

func (c *client) NextCheat() *model.Cheat {
	select {
	case msg := <-c.cheats:
		return msg
	default:
	}
	return nil
}

func (c *client) Close() {
	close(c.inputs)
	close(c.joins)
	close(c.cheats)
}

func (c *client) SendMessage(bytes []byte) error {
	return c.c.SendMessage(bytes)
}

func (c *client) routeMessage(msg *BerryhunterApi.ClientMessage) {

	// route message
	switch msg.BodyType() {
	case BerryhunterApi.ClientMessageBodyInput:
		i := codec.InputMessageFlatbufferUnmarshal(msg)
		// push input if possible, drop if overflow
		select {
		case c.inputs <- i:
		default:
			log.Print("Input dropped.")
		}
	case BerryhunterApi.ClientMessageBodyJoin:
		j := codec.JoinMessageFlatbufferUnmarshal(msg)
		c.joins <- j
	case BerryhunterApi.ClientMessageBodyCheat:
		m := codec.CheatMessageFlatbufferUnmarshal(msg)
		c.cheats <- m
	}
}

func NewClient(c *net.Client) model.Client {
	newClient := &client{
		c:      c,
		inputs: make(chan *model.PlayerInput, 2),
		joins:  make(chan *model.Join, 2),
		cheats: make(chan *model.Cheat, 2),
	}

	c.OnMessage(func(client *net.Client, bytes []byte) {
		msg := codec.ClientMessageFlatbufferUnmarshal(bytes)
		newClient.routeMessage(msg)
	})

	c.OnDisconnect(func(o *net.Client) {
		//TODO channel leak?
		//newClient.Close()
	})
	return newClient
}
