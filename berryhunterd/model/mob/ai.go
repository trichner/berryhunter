package mob

import (
	"github.com/trichner/berryhunter/berryhunterd/items/mobs"
	"github.com/trichner/berryhunter/berryhunterd/model/ai"
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"math/rand"
)

func newMobAi(d *mobs.MobDefinition, pos phy.Vec2f, rand *rand.Rand) *ai.AI {

	wander := ai.NewWander(&ai.WanderCfg{
		TurnRate: d.Factors.TurnRate,
		DeltaPhi: d.Factors.DeltaPhi,
		Speed:    0.055 * d.Factors.Speed,
	})

	return ai.NewAI(pos, wander, rand)
}
