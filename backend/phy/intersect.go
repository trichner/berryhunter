package phy

// AABB describes a axis-aligned bounding-box
type AABB struct {
	// left, bottom, upper and right
	L, B, U, R float32
}

// IntersectAabb tests if two AABBs intersect
func IntersectAabb(a *AABB, b *AABB) bool {

	if a.R < b.L {
		return false // a is left of b
	}

	if a.L > b.R {
		return false // a is right of b
	}

	if a.U < b.B {
		return false // a is above b
	}

	if a.B > b.U {
		return false // a is below b
	}

	return true // boxes overlap
}

// IntersectCircles tests if two circles intersect
func IntersectCircles(a *Circle, b *Circle) bool {

	d := a.center.Sub(b.center).AbsSq()
	r := a.Radius + b.Radius
	return d < r*r
}

func ArbiterShapes(a ColliderShape, b ColliderShape) bool {

	if a.Group() > 0 && a.Group() == b.Group() {
		return false
	}

	return (a.Layer() & b.Layer()) != 0
}
