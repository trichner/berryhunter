package main

import (
	"github.com/trichner/death-io/backend/net"
	"github.com/trichner/death-io/backend/DeathioApi"
)

//---- player
type player struct {
	*entity
	angle  float32
	collisionTracker
	Health uint
	Hunger uint
	client *net.Client
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
	e := newCircleEntity(0.5)


	e.body.UserData = e

	e.entityType = DeathioApi.EntityTypeCharacter
	p := &player{entity: e, client: c}
	p.body.UserData = p

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
