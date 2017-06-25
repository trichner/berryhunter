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

	CollisionResolver
}

type DynamicCollider interface {
	Collider

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
			Shape:      Shape{
				pos: pos,
				Layer: -1,
			},
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

func (c *colliderShape) resolveFancyCollisions() {

}

func (c *colliderShape) resolveFancyCollision(other Collider) Vec2f {

	md := c.bb.MinkowskiDiff(other.BoundingBox())
	// they already collide!
	if md.StabQuery(VEC2F_ZERO) {

	}

	// TODO
	return VEC2F_ZERO
}
