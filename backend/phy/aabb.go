package phy

import "fmt"

// AABB describes a axis-aligned bounding-box
type AABB struct {
	// left, bottom, upper and right
	Left, Bottom, Upper, Right float32
}

// String implements the Stringer interface and returns a nicely formatted string represenation
// of an AABB
func (bb *AABB) String() string {
	return fmt.Sprintf("l: %.2f, b: %.2f, u: %.2f, r: %.2f", bb.Left, bb.Bottom, bb.Upper, bb.Right)
}
