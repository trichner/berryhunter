package main

import (
	"fmt"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
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
	staticBody.UserData = "STATIC"
	shape = chipmunk.NewCircle(vect.Vector_Zero, 1)
	shape.UserData = "TREE"
	staticBody.AddShape(shape)
	space.AddBody(staticBody)


	// P-I ->    T

	// Body on the move
	shape = chipmunk.NewCircle(vect.Vector_Zero, 1)
	shape.UserData = "PLAYER"

	sensor := chipmunk.NewCircle(vect.Vect{1, 0}, 0.5)
	sensor.IsSensor = true
	sensor.UserData = "ITEM"
	sensor.Layer = 1

	body := newBody(1, shape)
	body.UserData = "MOVE"
	body.AddShape(shape)
	body.AddShape(sensor)
	body.UpdateShapes()
	body.SetPosition(vect.Vect{-10, 0})
	body.SetVelocity(1, 0)
	space.AddBody(body)

	body.CallbackHandler = &Collidable{}

	fmt.Printf("Shape:\t %+v\n", shape.BB)
	fmt.Printf("Sensor:\t %+v\n", sensor.BB)

	for i := 0; i < 400; i++ {
		space.Step(1.0 / 30.0)
	}
	fmt.Printf("Shape:\t %+v\n", shape.BB)
	fmt.Printf("Sensor:\t %+v\n", sensor.BB)
	// Output: Body 1
}

func ExampleSegmentQuery() {

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

	// sensor circle
	sensor := chipmunk.NewCircle(vect.Vect{1, 0}, 0.5)
	sensor.IsSensor = true
	sensor.Layer = -1
	sensor.UserData = "Sensor"

	shape = chipmunk.NewCircle(vect.Vector_Zero, 1)

	body := newBody(1, shape)
	body.AddShape(sensor)
	body.AddShape(shape)
	body.SetPosition(vect.Vect{-5, 0})
	body.SetVelocity(1, 0)
	body.UserData = "Collider"
	space.AddBody(body)

	body.CallbackHandler = &Collidable{}

	for i := 0; i < 400; i++ {
		space.Step(1.0 / 30.0)
	}
	fmt.Printf("Box: %+v\n", shape.BB)
	// Output: Body 1
}
