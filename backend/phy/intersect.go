package phy

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

// ArbiterShapes tests if two dynamicShapes can collide based on their
// respective Group and Layer. Returns true if they can collide.
func ArbiterShapes(a Collider, b Collider) bool {

	if a.Group() > 0 && a.Group() == b.Group() {
		return false
	}

	return (a.Layer() & b.Layer()) != 0
}

// taken from https://github.com/pgkelley4/line-segments-intersect/blob/master/js/line-segments-intersect.js
// which was adapted from http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
// returns the point where they intersect (if they intersect)
// returns +math.Inf if they don't intersect
// returns  if they are colinear
func ImpaleSegment(s1 Segment, s2 Segment) float32 {
	r := s1.direction
	s := s2.direction

	o1 := s1.origin
	o2 := s2.origin

	numerator := o2.Sub(o1).Cross(r)
	denominator := r.Cross(s)

	if numerator == 0 && denominator == 0 {
		// they are colinear
		return 0
	}

	if denominator == 0 {
		// lines are parallel
		return -1
	}

	u := numerator / denominator
	t := o2.Sub(o1).Cross(s) / denominator
	if t >= 0 && t <= 1 && u >= 0 && u <= 1 {
		return t
	}

	return -1
}