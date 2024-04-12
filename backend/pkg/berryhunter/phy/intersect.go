package phy

type Intersector interface {
	IntersectWith(i Intersector) bool
	intersectWithBox(b *Box) bool
	intersectWithCircle(c *Circle) bool
	intersectWithInvCircle(c *InvCircle) bool
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
	d := a.Position().Sub(b.Position()).AbsSq()
	r := a.Radius + b.Radius
	return d < r*r
}

// IntersectCircles tests if two circles intersect
// Note that the circle must have a smaller radius than the
// inverted circle for this to make any sense
func IntersectCircleInvCircle(a *Circle, b *InvCircle) bool {
	if a.Radius > b.Radius {
		return true
	}

	r := b.Radius - a.Radius
	return b.Position().Sub(a.Position()).AbsSq() >= r*r
}

// ArbiterShapes tests if two dynamicShapes can collide based on their
// respective Group and Layer. Returns true if they can collide.
func ArbiterShapes(a Collider, b Collider) bool {
	as := a.Shape()
	bs := b.Shape()
	if as.Group != 0 && as.Group == bs.Group {
		return false
	}

	return (as.Mask & bs.Layer) != 0
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
