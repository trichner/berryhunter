package main

import (
	"fmt"
	"github.com/vova616/chipmunk"
)

type Collidable struct {
}

func (c *Collidable) CollisionEnter(arbiter *chipmunk.Arbiter) bool {

	fmt.Printf("BoxA: %+v\n", arbiter.ShapeA.BB)
	fmt.Printf("BoxB: %+v\n", arbiter.ShapeB.BB)

	fmt.Printf("BodyA Data:\t %+v\n", arbiter.BodyA.UserData)
	fmt.Printf("BodyB Data:\t %+v\n", arbiter.BodyB.UserData)

	fmt.Printf("ShapeA Data:\t %+v\n", arbiter.ShapeA.UserData)
	fmt.Printf("ShapeB Data:\t %+v\n", arbiter.ShapeB.UserData)

	return true
}

func (c *Collidable) CollisionPreSolve(arbiter *chipmunk.Arbiter) bool {

	return true
}

func (c *Collidable) CollisionPostSolve(arbiter *chipmunk.Arbiter) {

}

func (c *Collidable) CollisionExit(arbiter *chipmunk.Arbiter) {

}
