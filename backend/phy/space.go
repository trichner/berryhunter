package phy

import (
	"bytes"
	"fmt"
)

type shapes []ColliderShape
type shapeSet map[ColliderShape]struct{}
type grid map[int]sparseShapesList
type sparseShapesList map[int]shapes

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
	yMap := grid[x]
	if yMap == nil {
		return nil
	}

	return yMap[y]
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
	for x, yMap := range s.grid {
		for y, list := range yMap {
			// add static objects if there are any relevant
			yStaticMap := s.gridStatic[x]
			if yStaticMap != nil {
				staticList := yStaticMap[y]
				list = append(list, staticList...)
			}
			s.bruteIntersectShapes(list)
		}
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

			cbb := current.BB()
			obb := other.BB()
			intersects := IntersectAabb(&cbb, &obb)
			if !intersects {
				continue
			}
			_ = intersects

			// force circles for now
			intersects = IntersectCircles(current.(Circle), other.(Circle))
			// RESOLVE collision
			current.AddCollision(other)
			other.AddCollision(current)
		}
	}

}

// AddShape appends a new shape to the existing ones
func (s *Space) AddShape(c Circle) {
	s.shapes[c] = struct{}{}
}

// AddStaticShape adds a static shape
// Important: static shapes cannot be moved nor removed
func (s *Space) AddStaticShape(c Circle) {
	s.insert(s.gridStatic, c)
}

func (s *Space) insert(grid grid, c ColliderShape) {

	bb := c.BB()
	intersectedChunks := make(map[Vec2i]struct{})

	intersectedChunks[Vec2i{floor32f(bb.l / gridWidth), floor32f(bb.b / gridWidth)}] = struct{}{}
	intersectedChunks[Vec2i{floor32f(bb.l / gridWidth), floor32f(bb.u / gridWidth)}] = struct{}{}

	intersectedChunks[Vec2i{floor32f(bb.r / gridWidth), floor32f(bb.b / gridWidth)}] = struct{}{}
	intersectedChunks[Vec2i{floor32f(bb.r / gridWidth), floor32f(bb.u / gridWidth)}] = struct{}{}

	for k := range intersectedChunks {
		s.insertAt(grid, k.X, k.Y, c)
	}
}

// insertAt inserts a shape at the specified x/y chunk coordinates in a grid
func (s *Space) insertAt(grid grid, x, y int, v ColliderShape) {

	yMap := grid[x]
	if yMap == nil {
		yMap = make(sparseShapesList)
	}

	shapeList := yMap[y]
	if shapeList == nil {
		shapeList = make(shapes, 0, 4)
	}
	shapeList = append(shapeList, v)

	yMap[y] = shapeList
	grid[x] = yMap
}

// String simple string representation of a space
func (s *Space) String() string {

	var buffer bytes.Buffer

	for x, yMap := range s.grid {
		for y, sparseList := range yMap {

			buffer.WriteString(fmt.Sprintf("%02d-%02d: %+v", x, y, sparseList))
			buffer.WriteString("\t ")
		}
		buffer.WriteString("\n")
	}

	return buffer.String()
}
