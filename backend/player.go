package main

import (
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
)

//---- player
type player struct {
	*entity
	angle  float32
	collisionTracker
	Health uint
	Hunger uint
	client *net.Client

	inventory inventory
}

type inventory struct {
	items []*itemStack
	cap   int
	add   itemStack
}

type itemType uint16

type itemStack struct {
	itemType itemType
	count    uint32
}

func (i *inventory) addItem(item *itemStack) bool {

	foundAt := -1
	for idx, stack := range i.items {
		if stack.itemType == item.itemType {
			foundAt = idx
			break
		}
	}

	// if we already have the same in the inventory we simply add it
	if foundAt >= 0 {
		i.items[foundAt].count += item.count
		return true
	}

	if i.cap > len(i.items) {
		i.items = append(i.items, item)
		return true
	}

	return false
}

func (i *inventory) canConsumeItems(stacks []*itemStack) bool {

	canConsume := true
	for _, s := range stacks {
		canConsume = canConsume && i.canConsume(s)
	}

	return canConsume
}

func (i *inventory) canConsume(stack *itemStack) bool {

	canConsume := false
	i.iterateItems(stack.itemType, func(idx int) bool {
		if i.items[idx].count >= stack.count {
			canConsume = true
		}
		return false
	})
	return canConsume
}

type itemStackPredicate func(i int) bool

func (i *inventory) consumeItems(stacks []*itemStack) bool {

	allConsumed := true
	for _, s := range stacks {
		allConsumed = allConsumed && i.consumeItem(s)
	}

	return allConsumed
}

func (i *inventory) consumeItem(stack *itemStack) bool {

	hasConsumed := false
	i.iterateItems(stack.itemType, func(idx int) bool {
		if i.items[idx].count >= stack.count {
			i.items[idx].count -= stack.count
			hasConsumed = true
		}

		return false
	})

	return hasConsumed
}

func (i *inventory) iterateItems(itemType itemType, p itemStackPredicate) {
	for idx, stack := range i.items {
		if stack.itemType == itemType {
			if !p(idx) {
				break
			}
		}
	}
}

func NewPlayer(c *net.Client) *player {
	e := newCircleEntity(0.25)


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
