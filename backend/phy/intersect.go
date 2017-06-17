package phy

import (
	"fmt"
)

// AABB describes a axis-aligned bounding-box
type AABB struct {
	// left, bottom, upper and right
	Left, Bottom, Upper, Right float32
}

func (bb *AABB) String() string {
	return fmt.Sprintf("l: %.2f, b: %.2f, u: %.2f, r: %.2f", bb.Left, bb.Bottom, bb.Upper, bb.Right)
}

// IntersectAabb tests if two AABBs intersect
func IntersectAabb(a *AABB, b *AABB) bool {

	if a.Right < b.Left {
		return false // a is left of b
	}

	if a.Left > b.Right {
		return false // a is right of b
	}

	if a.Upper < b.Bottom {
		return false // a is above b
	}

	if a.Bottom > b.Upper {
		return false // a is below b
	}

	return true // boxes overlap
}

// IntersectCircles tests if two circles intersect
func IntersectCircles(a *Circle, b *Circle) bool {

	d := a.pos.Sub(b.pos).AbsSq()
	r := a.Radius + b.Radius
	return d < r*r
}

func ArbiterShapes(a ColliderShape, b ColliderShape) bool {

	if a.Group() > 0 && a.Group() == b.Group() {
		return false
	}

	return (a.Layer() & b.Layer()) != 0
}
