package main

import (
	"github.com/vova616/chipmunk"
	"fmt"
)

type itemCollsionHandler func(other Entity, self Entity)

type entityCollider struct {
	Collidable
	shape   *chipmunk.Shape
	handler collisionHandler
}

type collisionHandler interface {
	CollisionEnter(self Entity, other Entity) bool
	CollisionExit(self Entity, other Entity)
}

func (c *entityCollider) CollisionEnter(arbiter *chipmunk.Arbiter) bool {

	fmt.Printf("ITEM_COLLSION! ENTER\n")
	if arbiter.ShapeB == c.shape {
		return c.collisionEnter(arbiter.BodyB, arbiter.BodyA)
	}

	if arbiter.ShapeA == c.shape {
		return c.collisionEnter(arbiter.BodyA, arbiter.BodyB)
	}

	fmt.Printf("But not sensor :(\n")
	return true
}

func (c *entityCollider) CollisionExit(arbiter *chipmunk.Arbiter) {

	fmt.Printf("ITEM_COLLSION! EXIT\n")
	if arbiter.ShapeB == c.shape {
		c.collisionExit(arbiter.BodyB, arbiter.BodyA)
	}

	if arbiter.ShapeA == c.shape {
		c.collisionExit(arbiter.BodyA, arbiter.BodyB)
	}

	fmt.Printf("But not sensor :(\n")
}

func (c *entityCollider) collisionEnter(self *chipmunk.Body, other *chipmunk.Body) bool {

	sud := self.UserData
	oud := other.UserData

	if oud == nil {
		return true
	}

	if sud == nil {
		panic("Self userData is nil!")
	}

	return c.handler.CollisionEnter(sud.(Entity), oud.(Entity))
}

func (c *entityCollider) collisionExit(self *chipmunk.Body, other *chipmunk.Body) {

	sud := self.UserData
	oud := other.UserData

	if oud == nil {
		return
	}

	if sud == nil {
		panic("Self userData is nil!")
	}

	c.handler.CollisionExit(sud.(Entity), oud.(Entity))
}
