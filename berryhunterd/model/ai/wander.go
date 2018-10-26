package ai

import (
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"math"
	"math/rand"
)

type wander struct {
	// wandering
	wanderAcceleration phy.Vec2f
	wanderDeltaPhi     float32
	wanderSpeed        float32
}

type WanderCfg struct {
	TurnRate float32
	DeltaPhi float32
	Speed    float32
}

func NewWander(cfg *WanderCfg) *wander {

	return &wander{
		wanderAcceleration: phy.Vec2f{cfg.TurnRate, 0},
		wanderDeltaPhi:     2 * math.Pi * cfg.DeltaPhi,
		wanderSpeed:        cfg.Speed,
	}
}

func (w *wander) Next(s *State) *State {

	heading := s.velocity.Normalize()

	// wandering
	heading, w.wanderAcceleration = wandering(heading, w.wanderAcceleration, w.wanderDeltaPhi, s.rand)

	s.velocity = heading.Mult(w.wanderSpeed)
	s.pos = s.pos.Add(s.velocity)

	return s
}

// http://natureofcode.com/book/chapter-6-autonomous-agents/
//
//       heading * wanderDistance
//   D ----------------->
//					   / acceleration
//                    v
//
func wandering(heading, acceleration phy.Vec2f, deltaPhi float32, r *rand.Rand) (newHeading, newAcceleration phy.Vec2f) {
	const wanderDistance float32 = 1

	wanderHeading := heading.Normalize().Mult(wanderDistance)

	// rotate wanderAcceleration by a random angle
	phi := (r.Float32()*2 - 1) * deltaPhi
	rMat := phy.NewRotMat2f(phi)
	acceleration = rMat.Mult(acceleration)

	// update the heading
	h := wanderHeading.Add(acceleration).Normalize()
	return h, acceleration
}
