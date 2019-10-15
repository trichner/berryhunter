package core

import (
	"github.com/trichner/berryhunter/berryhunterd/cfg"
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/items/mobs"
	"github.com/trichner/berryhunter/berryhunterd/model/factors"
)

type Configuration func(g *cfg.GameConfig) error

func Config(conf *cfg.Config) Configuration {
	return func(g *cfg.GameConfig) error {
		g.ColdFractionNightPerS = conf.Game.ColdFractionNightPerS
		g.ColdFractionDayPerS = conf.Game.ColdFractionDayPerS

		g.PlayerConfig = factors.MapPlayerFactors(conf.Game.Player, 0)

		if conf.Chieftain != nil {
			ctn := &cfg.ChieftainConfig{}
			ctn.Addr = conf.Chieftain.Addr
			if conf.Chieftain.PubSub != nil {
				ps := &cfg.PubSubConfig{}
				ps.ProjectId = conf.Chieftain.PubSub.ProjectId
				ps.TopicId = conf.Chieftain.PubSub.TopicId
				ctn.PubSubConfig = ps
			}
			g.ChieftainConfig = ctn
		}

		return nil
	}
}

func Registries(r items.Registry, m mobs.Registry, e effects.Registry) Configuration {
	return func(g *cfg.GameConfig) error {
		g.ItemRegistry = r
		g.MobRegistry = m
		g.EffectRegistry = e
		return nil
	}
}

func Tokens(t []string) Configuration {
	return func(g *cfg.GameConfig) error {
		g.Tokens = t
		return nil
	}
}

func Radius(r float32) Configuration {
	return func(g *cfg.GameConfig) error {
		g.Radius = r
		return nil
	}
}
