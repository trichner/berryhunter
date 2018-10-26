package ai

import (
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"math/rand"
)

type AI struct {
	state *State
}

func (a *AI) Next() *AI {

	n := a.state.behaviour.Next(a.state)
	a.state = n
	return a
}

func NewAI(pos phy.Vec2f, behaviour Behaviour, rand *rand.Rand) *AI {
	return &AI{
		state: &State{
			pos:       pos,
			velocity:  phy.Vec2f{1, 0},
			behaviour: behaviour,
			rand:      rand,
		},
	}
}

type State struct {
	pos      phy.Vec2f
	velocity phy.Vec2f
	rand     *rand.Rand

	behaviour Behaviour
}

func (a *AI) Position() phy.Vec2f {
	return a.state.pos
}

func (a *AI) Velocity() phy.Vec2f {
	return a.state.velocity
}

type Behaviour interface {
	Next(s *State) *State
}
