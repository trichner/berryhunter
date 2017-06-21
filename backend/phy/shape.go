package phy

import "fmt"

type ColliderSet map[Collider]struct{}

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

type DynamicShape struct {
	Shape

	velocity Vec2f
}

func (s *DynamicShape) Velocity() Vec2f {
	return s.velocity
}

func (s *DynamicShape) SetVelocity(v Vec2f) {
	s.velocity = v
}

type Collider interface {
	Position() Vec2f

	BoundingBox() AABB

	Collisions() ColliderSet

	Layer() int
	Group() int

	updateBB()
	resetCollisions()
	resolveCollisions()
	addCollision(s Collider)
}

type DynamicCollider interface {
	Collider

	Velocity() Vec2f
	SetVelocity(v Vec2f)
	Translate(v Vec2f)
	SetPosition(p Vec2f)
}

func newColliderShape(pos Vec2f) colliderShape {
	return colliderShape{
		Shape:      Shape{pos: pos},
		collisions: make(ColliderSet),
	}
}

func newDynamicColliderShape(pos Vec2f) dynamicColliderShape {
	return dynamicColliderShape{
		colliderShape: colliderShape{
			Shape:      Shape{pos: pos},
			collisions: make(ColliderSet),
		},
	}
}

type colliderShape struct {
	Shape
	collisions ColliderSet
}

type dynamicColliderShape struct {
	colliderShape

	v Vec2f
}

func (d *dynamicColliderShape) Velocity() Vec2f {
	return d.v
}

func (d *dynamicColliderShape) SetVelocity(v Vec2f) {
	d.v = v
}

func (d *dynamicColliderShape) Translate(v Vec2f) {
	d.SetPosition(d.Position().Add(v))
}

const returningForce = 0.2

func (c *colliderShape) resolveCollisions_Thomas() {

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

func (c *colliderShape) resolveCollisions() {
	if len(c.collisions) == 0 {
		return
	}


	fmt.Printf("Resolving collision: %+v\n", c)


	if len(c.collisions) > 1 {
		fmt.Print("Not sure how to solve multi collision :(");
	}

	force := Vec2f{}

	// calculate resulting force
	for other := range c.collisions {
		cRadius := c.bb.Left - c.pos.X
		otherRadius := other.BoundingBox().Left - other.Position().X
		offset := cRadius + otherRadius - c.pos.DistanceTo(other.Position())

		c.pos.X = c.pos.X *

		d := c.pos.Sub(other.Position())
		if d.AbsSq() == 0 {
			continue
		}
		d = d.Normalize()
		force = force.Add(d)
		break;
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

func (c *colliderShape) addCollision(s Collider) {
	c.collisions[s] = struct{}{}
}

func (c *colliderShape) resetCollisions() {
	c.collisions = make(ColliderSet)
}
