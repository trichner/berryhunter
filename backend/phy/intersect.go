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
func IntersectCircles(a *circle, b *circle) bool {

	d := a.origin.Sub(b.origin).AbsSq()
	r := a.radius + b.radius
	return d < r*r
}
