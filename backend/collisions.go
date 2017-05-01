package main

import (
	"github.com/vova616/chipmunk"
	"fmt"
)

type Collidable struct {
}

func (c *Collidable) CollisionEnter(arbiter *chipmunk.Arbiter) bool {

	fmt.Printf("BoxA: %+v\n", arbiter.ShapeA.BB)
	fmt.Printf("BoxB: %+v\n", arbiter.ShapeB.BB)

	return true
}

func (c *Collidable) CollisionPreSolve(arbiter *chipmunk.Arbiter) bool {

	return true
}

func (c *Collidable) CollisionPostSolve(arbiter *chipmunk.Arbiter) {

}

func (c *Collidable) CollisionExit(arbiter *chipmunk.Arbiter) {

}
