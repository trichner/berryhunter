package phy

import "fmt"

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
	return fmt.Sprintf("[ c: %.2f / %.2f, bb: (%s)]", c.pos.X, c.pos.Y, c.bb.String())
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

type colliderShape struct {
	Shape
	collisions ColliderSet
}

func (c *colliderShape) Layer() int {
	return c.Shape.Layer
}

func (c *colliderShape) Group() int {
	return c.Shape.Group
}

func (c *colliderShape) AddCollision(s ColliderShape) {
	c.collisions[s] = struct{}{}
}

func (c *colliderShape) ResetCollisions() {
	c.collisions = make(ColliderSet)
}

func (c *colliderShape) Collisions() ColliderSet {
	return c.collisions
}
