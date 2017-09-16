package core

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/items/mobs"
	"github.com/trichner/berryhunter/backend/conf"
)

type gameConfig struct {
	tokens       []string
	radius       float32
	itemRegistry items.Registry
	mobRegistry  mobs.Registry

	conf *conf.Config
}

type Configuration func(g *gameConfig) error

func Config(conf *conf.Config) Configuration {
	return func(g *gameConfig) error {
		g.conf = conf
		return nil
	}
}

func Items(r items.Registry) Configuration {
	return func(g *gameConfig) error {
		g.itemRegistry = r
		return nil
	}
}

func Mobs(m mobs.Registry) Configuration {
	return func(g *gameConfig) error {
		g.mobRegistry = m
		return nil
	}
}

func Tokens(t []string) Configuration {
	return func(g *gameConfig) error {
		g.tokens = t
		return nil
	}
}

func Radius(r float32) Configuration {
	return func(g *gameConfig) error {
		g.radius = r
		return nil
	}
}
