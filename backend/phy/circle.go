package phy

import (
	"math"
)

type ColliderSet map[ColliderShape]struct{}

type Shape struct {
	bb    AABB
	Layer int
	Group int
}

func (c *Shape) BoundingBox() AABB {
	return c.bb
}

type ColliderShape interface {
	BoundingBox() AABB
	ResetCollisions()
	AddCollision(s ColliderShape)
	Collisions() ColliderSet
	Layer() int
	Group() int
}

type collisionShape struct {
	Shape
	collisions ColliderSet
}

func (c *collisionShape) Layer() int {
	return c.Shape.Layer
}

func (c *collisionShape) Group() int {
	return c.Shape.Group
}

func (c *collisionShape) AddCollision(s ColliderShape) {
	c.collisions[s] = struct{}{}
}

func (c *collisionShape) ResetCollisions() {
	c.collisions = make(ColliderSet)
}

func (c *collisionShape) Collisions() ColliderSet {
	return c.collisions
}

type Circle interface {
	Center() Vec2f
	Radius() float32
}

type circleSet map[*Circle]struct{}

type circle struct {
	collisionShape

	radius   float32
	center   Vec2f
	isSensor bool

	collisions circleSet
}

func NewCircle(origin Vec2f, radius float32) *circle {
	c := &circle{
		radius: radius,
		center: origin,
	}

	c.Shape.Layer = -1

	radiusVector := Vec2f{radius, radius}
	lower := origin.Sub(radiusVector)
	upper := origin.Add(radiusVector)

	c.bb = AABB{lower.X, lower.Y, upper.Y, upper.X}
	return c
}

func (c *circle) Radius() float32 {
	return c.radius
}

func (c *circle) Center() Vec2f {
	return c.center
}

func (c *circle) intersectionArea(o Circle) float32 {

	// from https://stackoverflow.com/questions/4247889/area-of-intersection-between-two-circles
	r1 := c.radius
	r2 := o.Radius()
	dSq := c.center.Sub(o.Center()).AbsSq()

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
