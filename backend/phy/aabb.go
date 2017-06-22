package phy

import (
	"fmt"
)

// AABB describes a axis-aligned bounding-box
type AABB struct {
	// left, bottom, upper and right
	Left, Bottom, Upper, Right float32
}

// String implements the Stringer interface and returns a nicely formatted string represenation
// of an AABB
func (bb *AABB) String() string {
	return fmt.Sprintf("l: %.2f, b: %.2f, u: %.2f, r: %.2f", bb.Left, bb.Bottom, bb.Upper, bb.Right)
}

// Stab 'stabs' the AABB with a point and returns true if it is strictly inside the
// AABB, otherwise false
func (bb *AABB) StabQuery(p Vec2f) bool {
	if p.X < bb.Left { // left of bb
		return false
	}
	if p.X > bb.Right { // left of bb
		return false
	}
	if p.Y < bb.Bottom { // below bb
		return false
	}
	if p.Y > bb.Upper { // above bb
		return false
	}

	return true
}

// Size returns the size of the AABB
func (bb *AABB) Size() Vec2f {
	return Vec2f{bb.Right - bb.Left, bb.Upper - bb.Left}
}

// Center returns the center of the AABB
func (bb *AABB) Center() Vec2f {
	return Vec2f{(bb.Right + bb.Left) / 2.0, (bb.Upper + bb.Left) / 2.0}
}

// Translate returns a new AABB translated by f
func (bb *AABB) Translate(f Vec2f) AABB {

	l := bb.Left + f.X
	r := bb.Right + f.X

	b := bb.Bottom + f.Y
	u := bb.Upper + f.Y

	return AABB{l, b, u, r}
}

// MinkowskiDiff calculates the minkowski difference of two AABBs
// roughly from here: http://hamaluik.com/posts/simple-aabb-collision-using-minkowski-difference/
func (bb *AABB) MinkowskiDiff(other AABB) AABB {

	l := bb.Left - other.Right
	b := bb.Bottom - other.Upper

	r := bb.Right - other.Left
	u := bb.Upper - other.Bottom

	return AABB{l, b, u, r}
}

// ClosestPointOnBounds finds the smallest vector to the
// bounds of this AABB from the provided vector
func (bb *AABB) ClosestPointOnBounds(p Vec2f) Vec2f {

	minDist := abs32f(p.X - bb.Left)
	boundsPoint := Vec2f{bb.Left, p.Y}

	if abs32f(bb.Right-p.X) < minDist {
		minDist = abs32f(bb.Right - p.Y)
		boundsPoint = Vec2f{bb.Right, p.Y}
	}

	if abs32f(bb.Upper-p.Y) < minDist {
		minDist = abs32f(bb.Upper - p.Y)
		boundsPoint = Vec2f{p.X, bb.Upper}
	}

	if abs32f(bb.Bottom-p.Y) < minDist {
		minDist = abs32f(bb.Bottom - p.Y)
		boundsPoint = Vec2f{p.X, bb.Bottom}
	}

	return boundsPoint
}

// OriginBoundIntersection returns the scaling of the provided translation vector t that
// will make the AABB collide with the origin 0/0
func (bb *AABB) OriginBoundIntersection(t Vec2f) float32 {
	end := t

	// for each of the AABB's four edges
	// calculate the minimum fraction of "direction"
	// in order to find where the ray FIRST intersects
	// the AABB (if it ever does)
	var p1, p2 Vec2f
	var s1, s2 Segment
	p1 = Vec2f{bb.Left, bb.Bottom}
	p1 = Vec2f{bb.Left, bb.Upper}
	s1 = Segment{VEC2F_ZERO, end}
	s2 = Segment{p1, p2.Sub(p1)}
	minT := ImpaleSegment(s1, s2)

	var x float32
	p1 = Vec2f{bb.Left, bb.Upper}
	p2 = Vec2f{bb.Right, bb.Upper}
	s1 = Segment{VEC2F_ZERO, end}
	s2 = Segment{p1, p2.Sub(p1)}
	x = ImpaleSegment(s1, s2)
	if x < minT {
		minT = x
	}

	p1 = Vec2f{bb.Right, bb.Upper}
	p2 = Vec2f{bb.Right, bb.Bottom}
	s1 = Segment{VEC2F_ZERO, end}
	s2 = Segment{p1, p2.Sub(p1)}
	x = ImpaleSegment(s1, s2)
	if x < minT {
		minT = x
	}

	p1 = Vec2f{bb.Right, bb.Bottom}
	p2 = Vec2f{bb.Left, bb.Bottom}
	s1 = Segment{VEC2F_ZERO, end}
	s2 = Segment{p1, p2.Sub(p1)}
	x = ImpaleSegment(s1, s2)
	if x < minT {
		minT = x
	}

	// ok, now we should have found the fractional component along the ray where we collided
	return minT
}