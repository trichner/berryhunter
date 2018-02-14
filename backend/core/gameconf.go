package core

import (
	"github.com/trichner/berryhunter/backend/conf"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/items/mobs"
	"github.com/trichner/berryhunter/backend/model"
)

type config struct {
	tokens       []string
	radius       float32
	itemRegistry items.Registry
	mobRegistry  mobs.Registry

	coldFractionNightPerS   float32
	coldFractionRestingPerS float32

	playerConfig model.PlayerConfig
}

type Configuration func(g *config) error

func Config(conf *conf.Config) Configuration {
	return func(g *config) error {
		g.coldFractionNightPerS = conf.Game.ColdFractionNightPerS
		g.coldFractionRestingPerS = conf.Game.ColdFractionRestingPerS

		g.playerConfig.FreezingDamageTickFraction = conf.Game.Player.FreezingDamageTickFraction
		g.playerConfig.HealthGainSatietyLossTickFraction = conf.Game.Player.HealthGainSatietyLossTickFraction
		g.playerConfig.HealthGainSatietyThreshold = conf.Game.Player.HealthGainSatietyThreshold
		g.playerConfig.HealthGainTemperatureThreshold = conf.Game.Player.HealthGainTemperatureThreshold
		g.playerConfig.HealthGainTick = conf.Game.Player.HealthGainTick
		g.playerConfig.SatietyLossTickFraction = conf.Game.Player.SatietyLossTickFraction
		g.playerConfig.StarveDamageTickFraction = conf.Game.Player.StarveDamageTickFraction

		return nil
	}
}

func Registries(r items.Registry, m mobs.Registry) Configuration {
	return func(g *config) error {
		g.itemRegistry = r
		g.mobRegistry = m
		return nil
	}
}

func Tokens(t []string) Configuration {
	return func(g *config) error {
		g.tokens = t
		return nil
	}
}

func Radius(r float32) Configuration {
	return func(g *config) error {
		g.radius = r
		return nil
	}
}
