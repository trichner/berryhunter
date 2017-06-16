package phy

import (
	"math"
)

type circle struct {
	radius float32
	origin Vec2f
	_aabb  AABB
}

func NewCircle(origin Vec2f, radius float32) circle {
	c := circle{
		radius: radius,
		origin: origin,
	}

	lower := origin.Sub(Vec2f{-radius, -radius})
	upper := origin.Add(Vec2f{-radius, -radius})

	c._aabb = AABB{lower, upper}
	return c
}

func (c *circle) aabb() AABB {
	return c._aabb
}

func (c *circle) intersectionArea(o *circle) float32 {

	// from https://stackoverflow.com/questions/4247889/area-of-intersection-between-two-circles
	r1 := c.radius
	r2 := o.radius
	dSq := c.origin.Sub(o.origin).AbsSq()

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

	// precompute some reused values
	d := float32(math.Sqrt(float64(dSq)))
	r1Sq := r1 * r1
	r2Sq := r2 * r2

	p1 := r1Sq * acos32f((dSq+r1Sq-r2Sq)/(2*d*r1))
	p2 := r2Sq * acos32f((dSq+r2Sq-r1Sq)/(2*d*r2))
	p3 := 0.5 * sqrt32f((r1+r2-d)*(r1-r2+d)*(-r1+r2+d)*(r1+r2+d))

	return p1 + p2 - p3
}
