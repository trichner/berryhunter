package main

import (
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/items"
)

//---- player
type player struct {
	*entity
	angle  float32
	collisionTracker
	Health uint
	Hunger uint
	client *net.Client

	viewport *phy.Box

	inventory items.Inventory

	actionTick uint
}

const viewPortWidth = 20.0
const viewPortHeight = 12.0

func (p *player) Position() phy.Vec2f {
	return p.body.Position()
}
func (p *player) SetPosition(v phy.Vec2f) {
	p.body.SetPosition(v)
	p.viewport.SetPosition(v)
}

func NewPlayer(c *net.Client) *player {
	e := newCircleEntity(0.25)


	e.body.Shape().UserData = e

	e.entityType = DeathioApi.EntityTypeCharacter
	p := &player{entity: e, client: c}
	shapeGroup := int(p.ID())
	p.body.Shape().UserData = p
	p.body.Shape().Group = shapeGroup

	p.viewport = phy.NewBox(e.body.Position(), phy.Vec2f{viewPortWidth / 2, viewPortHeight / 2})

	p.viewport.Shape().IsSensor = true
	p.viewport.Shape().Layer = -1
	p.viewport.Shape().Group = shapeGroup

	p.inventory = items.NewInventory()
	p.inventory.AddItem(items.NewItemStack(DeathioApi.ItemWoodClub, 1))
	p.inventory.AddItem(items.NewItemStack(DeathioApi.ItemIronTool, 3))
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
