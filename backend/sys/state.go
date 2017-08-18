package sys

import (
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"log"
	"github.com/trichner/berryhunter/backend/model/player"
	"github.com/trichner/berryhunter/backend/model/spectator"
	"github.com/trichner/berryhunter/backend/minions"
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

	// upgrade spectators if they want to join
	for _, sp := range s.spectators {
		j := sp.Client().NextJoin()

		if j != nil {
			s.game.RemoveEntity(sp.Basic())
			// upgrade to p
			name := j.PlayerName // resolve collisions!
			client := sp.Client()
			log.Printf("☺️ '%s' joined!", name)
			sendAcceptMessage(client)
			p := player.New(s.game.Items, client, name)
			s.game.AddEntity(p)
		}
	}

	// downgrade players if they died
	for _, p := range s.players {

		if p.VitalSigns().Health == 0 {
			// kill p
			log.Printf("💀 '%s' died.", p.Name())
			sendObituaryMessage(p.Client())
			deathspot := p.Position()

			// remove the players placed entities
			for _, e := range p.OwnedEntities() {
				s.game.RemoveEntity(e)
			}

			// remove the player from the game
			s.game.RemoveEntity(p.Basic())

			// let the player be a new spectator at the spot of his demise
			deathView := spectator.NewSpectator(deathspot, p.Client())
			s.game.AddEntity(deathView)

		}
	}

}

func (s *ConnectionStateSystem) Remove(e ecs.BasicEntity) {

	s.removeFromPlayers(e)
	s.removeFromSpectators(e)
}

func (s *ConnectionStateSystem) removeFromSpectators(e ecs.BasicEntity) {
	arr := s.spectators
	delete := minions.FindBasic(func(i int) model.BasicEntity { return arr[i] }, len(arr), e)
	if delete >= 0 {
		s.spectators = append(arr[:delete], arr[delete+1:]...)
	}
}

func (s *ConnectionStateSystem) removeFromPlayers(e ecs.BasicEntity) {
	arr := s.players
	delete := minions.FindBasic(func(i int) model.BasicEntity { return arr[i] }, len(arr), e)
	if delete >= 0 {
		s.players = append(arr[:delete], arr[delete+1:]...)
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
	obituaryMsg := codec.ObituaryMessageFlatbufMarshal(builder)
	builder.Finish(obituaryMsg)
	c.SendMessage(builder.FinishedBytes())
}
