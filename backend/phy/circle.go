package phy

type circleSet map[*Circle]struct{}

type Circle struct {
	CollisionResolver
	dynamicColliderShape

	Radius float32
}

func (c *Circle) resolveCollisions() {
	if len(c.collisions) == 0 {
		return
	}

	returningForce := Vec2f{}

	// calculate resulting force
	for other := range c.collisions {

		f := c.resolveCollsionWith(other)
		returningForce = returningForce.Add(f)
	}

	c.SetPosition(c.pos.Add(returningForce))
}

func (c *Circle) resolveCollsionWith(collider CollisionResolver) Vec2f {
	return collider.resolveCollisionWithCircle(c)
}

func (c *Circle) resolveCollisionWithCircle(other *Circle) Vec2f {

	return resolveCircleThomas(c, other)
}

func resolveCircleThomas(c *Circle, other *Circle) Vec2f {

	//distance := c.pos.Sub(other.pos)
	distance := other.pos.Sub(c.pos)
	magnitude := distance.Abs()

	fMagnitude := c.Radius + other.Radius - magnitude
	if fMagnitude <= 0 {
		return Vec2f{}
	}

	var fDirection Vec2f

	// check that the circles are not exactly ontop of each other
	if magnitude != 0 {
		fDirection = distance.Div(magnitude)
	} else {
		// tie breaker, if they are exactly on each
		sig := sig32f(c.Radius - other.Radius)

		// screw this, we're out
		if sig == 0 {
			return Vec2f{}
		}

		fDirection = Vec2f{sig, 0}
	}

	return fDirection.Mult(fMagnitude)
}

func resolveCircleRaoul(circle *Circle, other *Circle) Vec2f {

	// calculate resulting force
	radii := circle.Radius + other.Radius
	// calculate required offset to resolve collision
	offset := radii - circle.pos.DistanceTo(other.Position())
	// Push a little further away to prevent endless collisions
	offset += 0.01
	angle := circle.pos.AngleBetween(other.Position())

	return Vec2f{cos32f(angle), sin32f(angle)}.Mult(-offset)
}

func (c *Circle) resolveCollisionWithBox(b *Box) Vec2f {
	panic("implement me")
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
