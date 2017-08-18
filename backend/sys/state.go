package sys

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"log"
	"github.com/trichner/berryhunter/backend/model/player"
	"github.com/trichner/berryhunter/backend/model/spectator"
)

type ConnectionStateSystem struct {
	spectators []model.Spectator
	players    []model.PlayerEntity
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

func (s *ConnectionStateSystem) AddPlayer(player model.PlayerEntity) {
	s.players = append(s.players, player)
}

func (s *ConnectionStateSystem) Update(dt float32) {
	// upgrade spectators
	for _, sp := range s.spectators {
		j := sp.Client().NextJoin()

		if j != nil {
			s.game.RemoveEntity(sp.Basic())
			// upgrade to p
			name := j.PlayerName // resolve collisions!
			client := sp.Client()
			log.Printf("☺️ Accepting new p: %s", name)
			sendAcceptMessage(client)
			p := player.New(s.game.Items, client, name)
			s.game.AddEntity(p)
		}
	}

	// downgrade players
	for _, p := range s.players {

		if p.VitalSigns().Health == 0 {
			// kill p
			sendObituaryMessage(p.Client())
			deathspot := p.Position()
			s.game.RemoveEntity(p.Basic())

			deathView := spectator.NewSpectator(deathspot, p.Client())
			s.game.AddEntity(deathView)

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

func sendAcceptMessage(c model.Client) {

	builder := flatbuffers.NewBuilder(32)
	acceptMsg := codec.AcceptMessageFlatbufMarshal(builder)
	builder.Finish(acceptMsg)
	c.SendMessage(builder.FinishedBytes())
}

func sendObituaryMessage(c model.Client) {

	builder := flatbuffers.NewBuilder(32)
	acceptMsg := codec.ObituaryMessageFlatbufMarshal(builder)
	builder.Finish(acceptMsg)
	c.SendMessage(builder.FinishedBytes())
}
