package main

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"log"
)

type SpectatorSystem struct {
	spectators []model.Spectator
	g          *Game
}

func NewSpectatorSystem(g *Game) *SpectatorSystem {
	return &SpectatorSystem{g: g}
}

func (*SpectatorSystem) Priority() int {
	return 10
}

func (s *SpectatorSystem) AddSpectator(spectator model.Spectator) {
	s.spectators = append(s.spectators, spectator)
	sendWelcomeMessage(s.g, spectator.Client())
}

func (s *SpectatorSystem) Update(dt float32) {
	for _, spectator := range s.spectators {
		j := spectator.Client().NextJoin()

		if j != nil {
			s.g.RemoveEntity(spectator.Basic())
			// upgrade to player
			name := j.PlayerName // resolve collisions!
			client := spectator.Client()
			log.Printf("☺️ Accepting new player: %s", name)
			sendAcceptMessage(client)
			p := NewPlayer(s.g, client, name)
			s.g.AddEntity(p)
		}
	}
}

func (s *SpectatorSystem) Remove(e ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range s.spectators {
		if entity.Basic().ID() == e.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		//e := p.players[delete]
		s.spectators = append(s.spectators[:delete], s.spectators[delete+1:]...)
	}
}

func sendWelcomeMessage(g *Game, c model.Client) {

	builder := flatbuffers.NewBuilder(32)
	welcomeMsg := codec.WelcomeMessageFlatbufMarshal(builder, g.welcomeMsg)
	builder.Finish(welcomeMsg)
	c.SendMessage(builder.FinishedBytes())
}

func sendAcceptMessage(c model.Client) {

	builder := flatbuffers.NewBuilder(32)
	acceptMsg := codec.AcceptMessageFlatbufMarshal(builder)
	builder.Finish(acceptMsg)
	c.SendMessage(builder.FinishedBytes())
}