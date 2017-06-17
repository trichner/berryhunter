package phy

// IntersectAabb tests if two AABBs intersect
func IntersectAabb(a *AABB, b *AABB) bool {

	if a.Right < b.Left {
		return false // a is left of b
	}

	if a.Left > b.Right {
		return false // a is right of b
	}

	if a.Upper < b.Bottom {
		return false // a is above b
	}

	if a.Bottom > b.Upper {
		return false // a is below b
	}

	return true // boxes overlap
}

// IntersectCircles tests if two circles intersect
func IntersectCircles(a *Circle, b *Circle) bool {

	d := a.pos.Sub(b.pos).AbsSq()
	r := a.Radius + b.Radius
	return d < r*r
}

// ArbiterShapes tests if two shapes can collide based on their
// respective Group and Layer. Returns true if they can collide.
func ArbiterShapes(a ColliderShape, b ColliderShape) bool {

	if a.Group() > 0 && a.Group() == b.Group() {
		return false
	}

	return (a.Layer() & b.Layer()) != 0
}
