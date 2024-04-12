package phy

import (
	"bytes"
	"fmt"
)

type (
	dynamicShapes []DynamicCollider
	shapeSet      map[DynamicCollider]struct{}
)

type (
	colliderGrid        map[Vec2i][]Collider
	dynamicColliderGrid map[Vec2i][]DynamicCollider
)

const gridWidth = 10

// floor32f is a math.Floor(f) for float32 to int
func floor32f(f float32) int {
	return int(f)
}

// NewSpace initializes a new Space
func NewSpace() *Space {
	return &Space{
		shapes:     make(shapeSet),
		gridStatic: make(colliderGrid),
	}
}

// Space represents a set of dynamic and static dynamicShapes that may collide
type Space struct {
	// list of all dynamic dynamicShapes
	shapes shapeSet

	// grid for dynamic bodies
	grid map[Vec2i][]DynamicCollider

	// grid for static bodies
	gridStatic colliderGrid

	radius float32
}

// getAt returns the list of dynamicShapes in a chunk
// Note: x and y are chunk coordinates, e.g. floor(X/gridWith)
func (s *Space) getStaticAt(x, y int) []Collider {
	return s.gridStatic[Vec2i{x, y}]
}

// Update runs collision detection over all boxes
func (s *Space) Update() {
	s.grid = make(dynamicColliderGrid)

	// reset all collisions and dynamic bodies
	for shape := range s.shapes {
		shape.resetCollisions()
		shape.updateBB()
		s.insert(shape)
	}

	// iterate over all chunks and brute force collisions
	for v, list := range s.grid {

		// add static objects if there are any relevant
		staticList := s.gridStatic[v]
		s.bruteIntersectShapes(staticList, list)
	}

	// reset all collisions and dynamic bodies
	for shape := range s.shapes {
		shape.resolveCollisions()
	}
}

// bruteIntersectShapes calculates collisions of a slice of dynamicShapes
// with brute force
func (s *Space) bruteIntersectShapes(statics []Collider, shapes []DynamicCollider) {
	n := len(shapes)
	// go over all dynamic shapes
	for i := 0; i < n; i++ {
		current := shapes[i]
		// check if any other dynamic shape collides
		for j := i + 1; j < n; j++ {
			other := shapes[j]

			cbb := current.BoundingBox()
			obb := other.BoundingBox()
			if !IntersectAabb(&cbb, &obb) {
				continue
			}

			ca := ArbiterShapes(current, other)
			oa := ArbiterShapes(other, current)
			if !(ca || oa) {
				continue
			}

			if !current.IntersectWith(other) {
				continue
			}

			if ca {
				current.addCollision(other)
			}
			if oa {
				other.addCollision(current)
			}
		}

		for j := 0; j < len(statics); j++ {
			other := statics[j]

			cbb := current.BoundingBox()
			obb := other.BoundingBox()
			if !IntersectAabb(&cbb, &obb) {
				continue
			}

			if !ArbiterShapes(current, other) {
				continue
			}

			if !current.IntersectWith(other) {
				continue
			}

			current.addCollision(other)
		}
	}
}

// AddShape appends a new shape to the existing ones
func (s *Space) AddShape(c DynamicCollider) {
	s.shapes[c] = struct{}{}
}

// RemoveShape removes a shape from the existing ones
func (s *Space) RemoveShape(c DynamicCollider) {
	delete(s.shapes, c)
}

// AddStaticShape adds a static shape
// Important: static dynamicShapes cannot be moved nor removed
func (s *Space) AddStaticShape(c Collider) {
	c.updateBB()
	s.insertStatic(c)
}

// insert inserts a new shape into the specified grid.
func (s *Space) insert(c DynamicCollider) {
	bb := c.BoundingBox()

	for x := floor32f(bb.Left / gridWidth); x <= floor32f(bb.Right/gridWidth); x++ {
		for y := floor32f(bb.Bottom / gridWidth); y <= floor32f(bb.Upper/gridWidth); y++ {
			s.insertAt(Vec2i{x, y}, c)
		}
	}
}

// insertAt inserts a shape at the specified x/y chunk coordinates
func (s *Space) insertAt(p Vec2i, v DynamicCollider) {
	list := s.grid[p]
	if list == nil {
		list = make([]DynamicCollider, 0, 4)
	}
	list = append(list, v)
	s.grid[p] = list
}

// insert inserts a new static shape into the specified grid.
// Note: static shapes may never be removed
func (s *Space) insertStatic(c Collider) {
	bb := c.BoundingBox()

	for x := floor32f(bb.Left / gridWidth); x <= floor32f(bb.Right/gridWidth); x++ {
		for y := floor32f(bb.Bottom / gridWidth); y <= floor32f(bb.Upper/gridWidth); y++ {
			s.insertStaticAt(Vec2i{x, y}, c)
		}
	}
}

// insertStaticAt inserts a static shape at the specified x/y chunk coordinates
func (s *Space) insertStaticAt(p Vec2i, v Collider) {
	list := s.gridStatic[p]
	if list == nil {
		list = make([]Collider, 0, 4)
	}
	list = append(list, v)
	s.gridStatic[p] = list
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
