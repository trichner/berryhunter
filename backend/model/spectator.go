package model

import (
	"github.com/trichner/berryhunter/backend/phy"
	"engo.io/ecs"
)

type Spectator interface {
	BasicEntity
	Position() phy.Vec2f
	SetPosition(phy.Vec2f)
	Bodies() Bodies
	Viewport() phy.DynamicCollider
	Client() Client
}

func NewSpectator(pos phy.Vec2f, client Client) Spectator {

	viewport := phy.NewBox(pos, phy.Vec2f{ViewPortWidth / 2, ViewPortHeight / 2})

	return &spectator{
		BasicEntity: ecs.NewBasic(),
		pos:         pos,
		viewport:    viewport,
		client:      client,
	}
}

type spectator struct {
	ecs.BasicEntity

	pos      phy.Vec2f
	viewport *phy.Box

	client Client
}

func (s *spectator) Basic() ecs.BasicEntity {
	return s.BasicEntity
}

func (s *spectator) Position() phy.Vec2f {
	return s.pos
}

func (s *spectator) SetPosition(pos phy.Vec2f) {
	s.pos = pos
	s.viewport.SetPosition(pos)
}

func (s *spectator) Bodies() Bodies {
	bodies := make(Bodies, 1)
	bodies[0] = s.viewport
	return bodies
}

func (s *spectator) Viewport() phy.DynamicCollider {
	return s.viewport
}

func (s *spectator) Client() Client {
	return s.client
}
