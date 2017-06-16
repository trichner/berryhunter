package phy

// AABB describes a axis-aligned bounding-box
type AABB struct {
	// left, bottom, upper and right
	l, b, u, r float32
}

// IntersectAabb tests if two AABBs intersect
func IntersectAabb(a *AABB, b *AABB) bool {

	if a.r < b.l {
		return false // a is left of b
	}
	if a.l > b.r {
		return false // a is right of b
	}
	if a.u < b.b {
		return false // a is above b
	}
	if a.b > b.u {
		return false // a is below b
	}

	return true // boxes overlap
}

// IntersectCircles tests if two circles intersect
func IntersectCircles(a Circle, b Circle) bool {

	d := a.Center().Sub(b.Center()).AbsSq()
	r := a.Radius() + b.Radius()
	return d < r*r
}
