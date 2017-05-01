package main

import (
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
	"fmt"
)

func ExampleBBQueryDynamic() {

	// setup space
	space := chipmunk.NewSpace()

	var shape *chipmunk.Shape
	var body *chipmunk.Body
	// add 1st body
	shape = chipmunk.NewCircle(vect.Vector_Zero, 1)
	mass := float32(1.0)
	body = newBody(mass, shape)
	body.UserData = "Body Numero Uno"
	body.AddShape(shape)
	space.AddBody(body)

	// 2nd body
	shape = chipmunk.NewCircle(vect.Vect{3, 7}, 1)
	body = newBody(mass, shape)
	body.UserData = "Body Numero Due"
	body.AddShape(shape)
	space.AddBody(body)

	bb := chipmunk.NewAABB(-1, -1, 1, 1)
	space.Query(nil, bb, func(a, b chipmunk.Indexable) {
		//usrA := a.Shape().Body.UserData
		usrB := b.Shape().Body.UserData
		fmt.Println(usrB)
	})

	// Output: Body Numero Uno
}

func ExampleBBQueryStatic() {

	// setup space
	space := chipmunk.NewSpace()

	var shape *chipmunk.Shape
	var staticBody *chipmunk.Body

	// body 1
	staticBody = chipmunk.NewBodyStatic()
	staticBody.UserData = "Body 1"
	shape = chipmunk.NewCircle(vect.Vector_Zero, 1)
	staticBody.AddShape(shape)
	space.AddBody(staticBody)

	// body 2
	staticBody = chipmunk.NewBodyStatic()
	staticBody.UserData = "Body 2"
	shape = chipmunk.NewCircle(vect.Vector_Zero, 1)
	staticBody.AddShape(shape)
	staticBody.SetPosition(vect.Vect{3, 0})
	space.AddBody(staticBody)

	// query
	bb := chipmunk.NewAABB(-1, -1, 1, 1)
	space.QueryStatic(nil, bb, func(a, b chipmunk.Indexable) {
		usrB := b.Shape().Body.UserData
		fmt.Println(usrB)
	})

	// Output: Body 1
}

func ExampleCollision() {

	// setup space
	space := chipmunk.NewSpace()

	var shape *chipmunk.Shape
	var staticBody *chipmunk.Body

	// static body to collide with
	staticBody = chipmunk.NewBodyStatic()
	staticBody.UserData = "Body 1"
	shape = chipmunk.NewCircle(vect.Vector_Zero, 1)
	staticBody.AddShape(shape)
	space.AddBody(staticBody)

	// Body on the move
	staticBody.UserData = "Collider"
	shape = chipmunk.NewCircle(vect.Vector_Zero, 1)
	body := newBody(1, shape)
	body.AddShape(shape)
	body.SetPosition(vect.Vect{-5, 0})
	body.SetVelocity(1, 0)
	space.AddBody(body)

	body.CallbackHandler = &Collidable{body}

	for i := 0; i < 100; i++ {
		space.Step(1.0 / 30.0)
	}
	// Output: Body 1
}

type Collidable struct {
	entity *chipmunk.Body
}

func (c *Collidable) CollisionEnter(arbiter *chipmunk.Arbiter) bool {

	fmt.Printf("Collision @ %f/%f\n", c.entity.Position().X, c.entity.Position().Y)
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
