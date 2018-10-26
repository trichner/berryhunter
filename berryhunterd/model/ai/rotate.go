package ai

import "github.com/trichner/berryhunter/berryhunterd/phy"

type rotate struct {
	// wandering
	rotMatrix phy.Mat2f
}

type RotateCfg struct {
	TurnRate float32
}

func NewRotate(cfg *RotateCfg) *rotate {

	return &rotate{
		rotMatrix: phy.NewRotMat2f(cfg.TurnRate),
	}
}

func (r *rotate) Next(s *State) *State {

	s.velocity = r.rotMatrix.Mult(s.velocity).Normalize()
	return s
}
