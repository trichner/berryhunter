package sys

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"log"
	"github.com/trichner/berryhunter/backend/model/player"
)

type ConnectionStateSystem struct {
	spectators []model.Spectator
	game       *Game
}

func NewConnectionStateSystem(g *Game) *ConnectionStateSystem {
	return &ConnectionStateSystem{game: g}
}

func (*ConnectionStateSystem) Priority() int {
	return 10
}

func (s *ConnectionStateSystem) AddSpectator(spectator model.Spectator) {
	s.spectators = append(s.spectators, spectator)
	sendWelcomeMessage(s.game, spectator.Client())
}

func (s *ConnectionStateSystem) Update(dt float32) {
	for _, spectator := range s.spectators {
		j := spectator.Client().NextJoin()

		if j != nil {
			s.game.RemoveEntity(spectator.Basic())
			// upgrade to player
			name := j.PlayerName // resolve collisions!
			client := spectator.Client()
			log.Printf("☺️ Accepting new player: %s", name)
			sendAcceptMessage(client)
			p := player.New(s.game.Items, client, name)
			s.game.AddEntity(p)
		}
	}
}

func (s *ConnectionStateSystem) Remove(e ecs.BasicEntity) {
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
	welcomeMsg := codec.WelcomeMessageFlatbufMarshal(builder, g.WelcomeMsg)
	builder.Finish(welcomeMsg)
	c.SendMessage(builder.FinishedBytes())
}

func sendAcceptMessage(c model.Client) {

	builder := flatbuffers.NewBuilder(32)
	acceptMsg := codec.AcceptMessageFlatbufMarshal(builder)
	builder.Finish(acceptMsg)
	c.SendMessage(builder.FinishedBytes())
}
