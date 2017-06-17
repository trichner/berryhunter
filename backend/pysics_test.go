package main

import (
	"fmt"
	"github.com/vova616/chipmunk"
	"github.com/vova616/chipmunk/vect"
)

func ExampleBBQueryDynamic() {

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

}

func ExampleSegmentQuery() {

}
