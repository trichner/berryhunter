package phy

import "log"

type invCircleSet map[*InvCircle]struct{}

var _ = Collider(&InvCircle{})

type InvCircle struct {
	CollisionResolver
	dynamicColliderShape

	Radius float32
}

func (c *InvCircle) IntersectWith(i Intersector) bool {
	return i.intersectWithInvCircle(c)
}

func (c *InvCircle) intersectWithInvCircle(i *InvCircle) bool {
	panic("always collides")
}

func (c *InvCircle) intersectWithCircle(circle *Circle) bool {
	return IntersectCircleInvCircle(circle, c)
}

func (c *InvCircle) intersectWithBox(b *Box) bool {
	log.Printf("Box: %+v", b.Shape().UserData)
	panic("not implemented")
}

func (c *InvCircle) resolveCollisions() {
	if len(c.collisions) == 0 {
		return
	}

	if c.shape.IsSensor {
		return
	}

	returningForce := Vec2f{}

	// calculate resulting force
	for other := range c.collisions {
		if other.Shape().IsSensor {
			continue
		}

		f := c.resolveCollsionWith(other)
		returningForce = returningForce.Add(f)
	}

	c.SetPosition(c.shape.pos.Add(returningForce))
}

func (c *InvCircle) resolveCollsionWith(collider CollisionResolver) Vec2f {
	return collider.resolveCollisionWithInvCircle(c)
}

func (c *InvCircle) resolveCollisionWithCircle(other *Circle) Vec2f {
	return resolveInvCircle(other, c)
}

func NewInvCircle(pos Vec2f, radius float32) *InvCircle {
	c := &InvCircle{
		Radius:               radius,
		dynamicColliderShape: newDynamicColliderShape(pos),
	}

	// collide with nothing
	c.Shape().Layer = 0

	c.updateBB()
	return c
}

// updates the circles bounding box according to its radius and position.
// this is a bit of a hack since an inverted circle is not really bounded
func (c *InvCircle) updateBB() {
	radiusVector := Vec2f{c.Radius * 2, c.Radius * 2}
	lower := c.Position().Sub(radiusVector)
	upper := c.Position().Add(radiusVector)

	c.shape.bb = AABB{lower.X, lower.Y, upper.Y, upper.X}
}
