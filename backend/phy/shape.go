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

	Collisions() ColliderSet

	Layer() int
	Group() int

	updateBB()
	resetCollisions()
	resolveCollisions()
	addCollision(s ColliderShape)
}

func newColliderShape(pos Vec2f) colliderShape {
	return colliderShape{
		Shape:      Shape{pos: pos},
		collisions: make(ColliderSet),
	}
}

type colliderShape struct {
	Shape
	collisions ColliderSet
}

const returningForce = 0.2

func (c *colliderShape) resolveCollisions() {

	if len(c.collisions) == 0 {
		return
	}

	fmt.Printf("Resolving collision: %+v\n", c)

	force := Vec2f{}

	// calculate resulting force
	for other := range c.collisions {
		d := c.pos.Sub(other.Position())
		if d.AbsSq() == 0 {
			continue
		}
		d = d.Normalize()
		force = force.Add(d)
	}

	if force.AbsSq() == 0 {
		//TODO: What do?
		return
	}

	// apply force
	force = force.Normalize().Mult(returningForce)
	c.SetPosition(c.pos.Add(force))
}

func (c *colliderShape) Layer() int {
	return c.Shape.Layer
}

func (c *colliderShape) Group() int {
	return c.Shape.Group
}

func (c *colliderShape) Collisions() ColliderSet {
	return c.collisions
}

func (c *colliderShape) addCollision(s ColliderShape) {
	c.collisions[s] = struct{}{}
}

func (c *colliderShape) resetCollisions() {
	c.collisions = make(ColliderSet)
}
