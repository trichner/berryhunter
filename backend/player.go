package main

import (
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"github.com/trichner/death-io/backend/net"
	"github.com/trichner/death-io/backend/DeathioApi"
)

//---- player
type player struct {
	*entity
	collisionTracker
	hitSensor *chipmunk.Shape
	Health    uint
	Hunger    uint
	client    *net.Client
}

type inventory struct {
	items []itemStack
}

type itemStack struct {
	itemType uint16
	count    uint32
}

const playerCollisionGroup = -1

func NewPlayer(c *net.Client) *player {
	e := newCircleEntity(0.5, 1)

	sensor := chipmunk.NewCircle(vect.Vect{0.25, 0}, 0.5)
	sensor.IsSensor = true
	sensor.Layer = ressourceCollisionLayer
	sensor.UserData = "SENSOR"

	e.body.AddShape(sensor)
	e.body.CallbackHandler = &Collidable{}
	e.body.UserData = e

	e.body.UpdateShapes()

	e.entityType = DeathioApi.EntityTypeCharacter
	for _, s := range e.body.Shapes {
		s.Group = playerCollisionGroup
	}
	p := &player{entity: e, client: c, hitSensor: sensor}
	p.body.UserData = p

	p.collisionTracker = newCollisionTracker()

	p.body.CallbackHandler = &entityCollider{
		shape: sensor,
		handler: &p.collisionTracker,
	}

	return p
}

type collisionTracker struct {
	collisions map[uint64]Entity
}

func newCollisionTracker() collisionTracker {
	c := collisionTracker{}
	c.collisions = make(map[uint64]Entity)
	return c
}

func (c *collisionTracker) CollisionEnter(self Entity, other Entity) bool {
	c.collisions[other.ID()] = other
	return true
}

func (c *collisionTracker) CollisionExit(self Entity, other Entity) {
	delete(c.collisions, other.ID())
}
