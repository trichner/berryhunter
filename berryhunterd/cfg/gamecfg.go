package cfg

import (
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/items/mobs"
	"github.com/trichner/berryhunter/berryhunterd/model/factors"
)

type GameConfig struct {
	Tokens       []string
	Radius       float32
	ItemRegistry items.Registry
	MobRegistry  mobs.Registry
	EffectRegistry  effects.Registry

	ColdFractionNightPerS float32
	ColdFractionDayPerS   float32

	PlayerConfig    factors.PlayerFactors
	ChieftainConfig *ChieftainConfig
}

type ChieftainConfig struct {
	Addr *string
	PubSubConfig *PubSubConfig
}

type PubSubConfig struct {
	ProjectId string
	TopicId	string
}

