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

// updates the circles bounding box according to its radius and position.
func (c *Circle) updateBB() {

	radiusVector := Vec2f{c.Radius, c.Radius}
	lower := c.pos.Sub(radiusVector)
	upper := c.pos.Add(radiusVector)

	c.bb = AABB{lower.X, lower.Y, upper.Y, upper.X}
}

func (c *Circle) intersectionArea(o *Circle) float32 {

	// from https://stackoverflow.com/questions/4247889/area-of-intersection-between-two-circles
	r1 := c.Radius
	r2 := o.Radius
	dSq := c.pos.Sub(o.pos).AbsSq()

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
