package phy

import (
	"math"
	"fmt"
)

type ColliderSet map[ColliderShape]struct{}

type Shape struct {
	Layer    int
	Group    int
	IsSensor bool
	UserData interface{}

	pos Vec2f
	bb  AABB
}

func (c *Shape) String() string {
	return fmt.Sprintf("[ c: %f / %f, bb: (%s)]", c.pos.X, c.pos.Y, c.bb.String())
}

func (c *Shape) BoundingBox() AABB {
	return c.bb
}

func (c *Shape) Position() Vec2f {
	return c.pos
}

func (c *Shape) SetPosition(v Vec2f) {
	c.pos = v
}

type ColliderShape interface {
	SetPosition(p Vec2f)
	Position() Vec2f

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

type circleSet map[*Circle]struct{}

type Circle struct {
	collisionShape

	Radius float32

	collisions circleSet
}

func NewCircle(center Vec2f, radius float32) *Circle {
	c := &Circle{
		Radius: radius,
		collisionShape: collisionShape{Shape: Shape{pos: center },
		},
	}

	c.Shape.Layer = -1
	c.updateBB()
	return c
}

func (c *Circle) updateBB() {

	radiusVector := Vec2f{c.Radius, c.Radius}
	lower := c.pos.Sub(radiusVector)
	upper := c.pos.Add(radiusVector)

	c.bb = AABB{lower.X, lower.Y, upper.Y, upper.X}
}

func (c *Circle) SetPosition(p Vec2f) {
	c.pos = p
	c.updateBB()
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
