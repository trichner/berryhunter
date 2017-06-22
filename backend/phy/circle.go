package phy

import (
	"math"
)

type circleSet map[*Circle]struct{}

type Circle struct {
	dynamicColliderShape

	Radius float32

	collisions circleSet
}

func NewCircle(pos Vec2f, radius float32) *Circle {
	c := &Circle{
		Radius:        radius,
		dynamicColliderShape: newDynamicColliderShape(pos),
	}

	// collide with everything
	c.Shape.Layer = -1

	c.updateBB()
	return c
}

func (circle *Circle) MinkowskiDiff(other *Circle) *Circle {

	r := circle.Radius + other.Radius
	o := circle.pos.Sub(other.pos)

	return NewCircle(o, r)
}

// Stabs the shape and returns true if the point lies on the shape
func (circle *Circle) StabQuery(p Vec2f) bool {

	return circle.pos.Sub(p).AbsSq() < circle.Radius*circle.Radius
}

// Stabs the shape and returns true if the point lies on the shape
func (circle *Circle) ImpaleQuery(s Segment) float32 {

	// is the segment already inside?
	if circle.StabQuery(s.origin) {
		return 0
	}

	// Solve the following system for t
	// 1: origin + t * (end-origin) = e
	// 2: (ex - cx)^2 + (ey - cy)^2 = r^2

	d := s.direction
	o := s.origin
	r := circle.Radius

	f := o.Sub(circle.pos)

	// values for quadratic equation
	a := d.Dot(d)
	b := 2 * f.Dot(d)
	c := f.Dot(f) - r*r

	// Solve quadratic equation
	discriminant := b*b - 4*a*c
	if discriminant < 0 {
		// complex result, no intersection
		return -1
	}

	discriminant = sqrt32f(discriminant)

	// either solution may be on or off the ray so need to test both
	// t1 is always the smaller value, because both discriminant and a are
	// non-negative
	t1 := (-b - discriminant) / (2 * a)
	t2 := (-b + discriminant) / (2 * a)

	if t1 >= 0 && t1 <= 1 {
		return t1
	}

	if t2 >= 0 && t2 <= 1 {
		return t2
	}

	// no impale
	return -1
}

// updates the circles bounding box according to its radius and position.
func (circle *Circle) updateBB() {

	radiusVector := Vec2f{circle.Radius, circle.Radius}
	lower := circle.pos.Sub(radiusVector)
	upper := circle.pos.Add(radiusVector)

	circle.bb = AABB{lower.X, lower.Y, upper.Y, upper.X}
}

func (circle *Circle) intersectionArea(o *Circle) float32 {

	// from https://stackoverflow.com/questions/4247889/area-of-intersection-between-two-circles
	r1 := circle.Radius
	r2 := o.Radius
	dSq := circle.pos.Sub(o.pos).AbsSq()

	rdSq := (r1 + r2) * (r1 + r2)

	// not intersecting?
	if rdSq < dSq {
		return 0
	}

	if r2 < r1 {
		// swap
		r1, r2 = r2, r1
	}

	// fully intersecting?
	if dSq == 0 {
		return r2 * r2 * math.Pi
	}

	// pre-compute some reused values
	d := float32(math.Sqrt(float64(dSq)))
	r1Sq := r1 * r1
	r2Sq := r2 * r2

	p1 := r1Sq * acos32f((dSq+r1Sq-r2Sq)/(2*d*r1))
	p2 := r2Sq * acos32f((dSq+r2Sq-r1Sq)/(2*d*r2))
	p3 := 0.5 * sqrt32f((r1+r2-d)*(r1-r2+d)*(-r1+r2+d)*(r1+r2+d))

	return p1 + p2 - p3
}
