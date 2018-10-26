package ai

import "github.com/trichner/berryhunter/berryhunterd/phy"

type Move interface {
	Next(s *State) (*State, bool)
}

type jump struct {
	duration, t int
	from, to    phy.Vec2f
}

func NewJump(s *State, distance phy.Vec2f, duration int) *jump {

	return &jump{
		from:     s.pos,
		to:       s.pos.Add(distance),
		duration: duration,
	}
}

func (j *jump) Next(s *State) (*State, bool) {
	j.t++

	t := float32(j.t) / float32(j.duration)
	s.pos = phy.Lerp(j.from, j.to, t)
	return s, t >= 1
}
