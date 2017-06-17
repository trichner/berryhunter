package phy

import (
	"bytes"
	"fmt"
)

type shapes []ColliderShape
type shapeSet map[ColliderShape]struct{}
type grid map[Vec2i]shapes

const gridWidth = 10

// floor32f is a math.Floor(f) for float32 to int
func floor32f(f float32) int {
	return int(f)
}

// NewSpace intialises a new Space
func NewSpace() *Space {

	return &Space{
		shapes: make(shapeSet),
		grid:   make(grid),
	}
}

// Space represents a set of dynamic and static shapes that may collide
type Space struct {
	// list of all dynamic shapes
	shapes shapeSet

	// grid for dynamic bodies
	grid       grid

	// grid for static bodies
	gridStatic grid
}

// getAt returns the list of shapes in a chunk
// Note: x and y are chunk coordinates, e.g. floor(X/gridWith)
func (s *Space) getAt(grid grid, x, y int) shapes {
	return grid[Vec2i{x, y}]
}

// Update runs collision detection over all boxes
func (s *Space) Update() {

	s.grid = make(grid)

	// reset all collisions and dynamic bodies
	for shape := range s.shapes {
		shape.ResetCollisions()
		s.insert(s.grid, shape)
	}

	// iterate over all chunks and brute force collisions
	for v, list := range s.grid {
		// add static objects if there are any relevant
		staticList := s.gridStatic[v]
		if staticList != nil {
			list = append(list, staticList...)
		}
		s.bruteIntersectShapes(list)
	}
}

// bruteIntersectShapes calculates collisions of a slice of shapes
// with brute force
func (s *Space) bruteIntersectShapes(shapes shapes) {

	n := len(shapes)
	for i := 0; i < n; i++ {
		current := shapes[i]
		for j := i + 1; j < n; j++ {
			other := shapes[j]

			cbb := current.BoundingBox()
			obb := other.BoundingBox()
			if !IntersectAabb(&cbb, &obb) {
				continue
			}

			//force circles for now
			currentCircle := current.(*Circle)
			otherCircle := other.(*Circle)
			if !IntersectCircles(currentCircle, otherCircle) {
				continue
			}

			if !ArbiterShapes(current, other) {
				continue
			}

			current.AddCollision(other)
			other.AddCollision(current)
		}
	}

}

// AddShape appends a new shape to the existing ones
func (s *Space) AddShape(c ColliderShape) {
	s.shapes[c] = struct{}{}
}

// RemoveShape removes a shape from the existing ones
func (s *Space) RemoveShape(c ColliderShape) {
	delete(s.shapes, c)
}

// AddStaticShape adds a static shape
// Important: static shapes cannot be moved nor removed
func (s *Space) AddStaticShape(c ColliderShape) {
	s.insert(s.gridStatic, c)
}

// insert inserts a new shape into the specified grid.
func (s *Space) insert(grid grid, c ColliderShape) {

	bb := c.BoundingBox()

	for x := floor32f(bb.Left / gridWidth); x <= floor32f(bb.Right/gridWidth); x++ {
		for y := floor32f(bb.Bottom / gridWidth); y <= floor32f(bb.Upper/gridWidth); y++ {
			s.insertAt(grid, x, y, c)
		}
	}
}

// insertAt inserts a shape at the specified x/y chunk coordinates in a grid
func (s *Space) insertAt(grid grid, x, y int, v ColliderShape) {

	p := Vec2i{x, y}
	list := grid[p]
	if list == nil {
		list = make(shapes, 0, 4)
	}
	list = append(list, v)
	grid[p] = list
}

// String simple string representation of a space
func (s *Space) String() string {

	var buffer bytes.Buffer

	for v, list := range s.grid {

		buffer.WriteString(fmt.Sprintf("%02d-%02d: %+v", v.X, v.Y, list))
		buffer.WriteString("\t ")
		buffer.WriteString("\n")
	}

	return buffer.String()
}
