package phy

// Box represents a simple axis-aligned box
// TODO make it work for non-aligned boxes
type Box struct {
	CollisionResolver
	dynamicColliderShape

	// the vector pointing from the center (pos) to the upper right corner
	extent Vec2f
}

func (b *Box) resolveCollsionWith(c CollisionResolver) Vec2f {
	// double dispatching
	return c.resolveCollisionWithBox(b)
}

func (b *Box) resolveCollisionWithCircle(circle *Circle) Vec2f {
	panic("implement me")
}

func (b *Box) resolveCollisionWithBox(box *Box) Vec2f {
	panic("implement me")
}

func NewBox(pos, extent Vec2f) *Box {
	b := &Box{
		extent:               extent,
		dynamicColliderShape: newDynamicColliderShape(pos),
	}

	b.updateBB()
	return b
}

// Stabs the shape and returns true if the point lies on the shape
func (b *Box) StabQuery(p Vec2f) bool {
	return b.bb.StabQuery(p)
}

// Stabs the shape and returns true if the point lies on the shape
func (b *Box) ImpaleQuery(s Segment) float32 {
	panic("Not implemented :(")
	return -1
}

// updates the bounding box according to the size and position of this box
func (b *Box) updateBB() {

	lower := b.pos.Sub(b.extent)
	upper := b.pos.Add(b.extent)

	b.bb = AABB{lower.X, lower.Y, upper.Y, upper.X}
}
