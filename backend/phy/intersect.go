package phy

// AABB describes a axis-aligned bounding-box
type AABB struct {
	// lower left corner and upper right
	Lower, Upper Vec2f
}
