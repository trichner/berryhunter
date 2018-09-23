package core

import (
	"github.com/trichner/berryhunter/berryhunterd/cfg"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/items/mobs"
)

type Configuration func(g *cfg.GameConfig) error

func Config(conf *cfg.Config) Configuration {
	return func(g *cfg.GameConfig) error {
		g.ColdFractionNightPerS = conf.Game.ColdFractionNightPerS
		g.ColdFractionDayPerS = conf.Game.ColdFractionDayPerS
		g.HeatFractionPerS = conf.Game.HeatFractionPerS;

		g.PlayerConfig.FreezingDamageTickFraction = conf.Game.Player.FreezingDamageTickFraction
		g.PlayerConfig.HealthGainSatietyLossTickFraction = conf.Game.Player.HealthGainSatietyLossTickFraction
		g.PlayerConfig.HealthGainSatietyThreshold = conf.Game.Player.HealthGainSatietyThreshold
		g.PlayerConfig.HealthGainTemperatureThreshold = conf.Game.Player.HealthGainTemperatureThreshold
		g.PlayerConfig.HealthGainTick = conf.Game.Player.HealthGainTick
		g.PlayerConfig.SatietyLossTickFraction = conf.Game.Player.SatietyLossTickFraction
		g.PlayerConfig.StarveDamageTickFraction = conf.Game.Player.StarveDamageTickFraction
		g.PlayerConfig.WalkingSpeedPerTick = conf.Game.Player.WalkingSpeedPerTick

		if conf.Chieftain != nil {
			ctn := &cfg.ChieftainConfig{}
			ctn.Addr = conf.Chieftain.Addr
			g.ChieftainConfig = ctn
		}

		return nil
	}
}

func Registries(r items.Registry, m mobs.Registry) Configuration {
	return func(g *cfg.GameConfig) error {
		g.ItemRegistry = r
		g.MobRegistry = m
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
