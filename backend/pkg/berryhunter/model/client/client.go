package client

import (
	"log"

	"github.com/google/uuid"
	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
	"github.com/trichner/berryhunter/pkg/berryhunter/codec"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/net"
)

var _ = model.Client(&client{})

type client struct {
	c      *net.Client
	joins  chan *model.Join
	inputs chan *model.PlayerInput
	cheats chan *model.Cheat
	chat   chan *model.ChatMessage
	uuid   uuid.UUID
}

func (c *client) UUID() uuid.UUID {
	return c.uuid
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

func (c *client) NextChatMessage() *model.ChatMessage {
	select {
	case msg := <-c.chat:
		return msg
	default:
	}
	return nil
}

func (c *client) Close() {
	c.c.Close()
	close(c.inputs)
	close(c.joins)
	close(c.cheats)
	close(c.chat)
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
		select {
		case c.joins <- j:
		default:
			log.Print("Join dropped.")
		}
	case BerryhunterApi.ClientMessageBodyCheat:
		m := codec.CheatMessageFlatbufferUnmarshal(msg)
		select {
		case c.cheats <- m:
		default:
			log.Print("Cheat dropped.")
		}
	case BerryhunterApi.ClientMessageBodyChatMessage:
		m := codec.ChatMessageFlatbufferUnmarshal(msg)
		select {
		case c.chat <- m:
		default:
			log.Print("ChatMessage dropped.")
		}
	}
}

func NewClient(c *net.Client) model.Client {
	newClient := &client{
		c:      c,
		inputs: make(chan *model.PlayerInput, 2),
		joins:  make(chan *model.Join, 2),
		cheats: make(chan *model.Cheat, 2),
		chat:   make(chan *model.ChatMessage, 2),
		uuid:   uuid.New(),
	}

	c.OnMessage(func(client *net.Client, bytes []byte) {
		msg := codec.ClientMessageFlatbufferUnmarshal(bytes)
		newClient.routeMessage(msg)
	})

	c.OnDisconnect(func(o *net.Client) {
		// TODO channel leak?
		// newClient.Close()
	})
	return newClient
}
