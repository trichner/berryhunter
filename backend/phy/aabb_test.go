package phy

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"fmt"
)

func TestAABB_Size(t *testing.T) {

	var bb AABB

	bb = AABB{0, 0, 1, 1}
	assert.Equal(t, Vec2f{1, 1}, bb.Size(), "Size is correct")

	bb = AABB{-1, -1, 2, 1}
	assert.Equal(t, Vec2f{2, 3}, bb.Size(), "Size is correct")
}

func TestAABB_MinkowskiDiff_positive(t *testing.T) {

	var b1, b2 AABB

	b1 = AABB{0, 0, 2, 2}

	b2 = AABB{-1, -1, 1, 1}

	diff := b1.MinkowskiDiff(b2)

	intersects := diff.StabQuery(Vec2f{})

	fmt.Printf("CP: %+v", diff.ClosestPointOnBounds(VEC2F_ZERO))

	assert.Equal(t, IntersectAabb(&b1, &b2), intersects, "Do intersect")
}
func TestAABB_MinkowskiDiff_negative(t *testing.T) {

	var b1, b2 AABB

	b1 = AABB{0, 0, 2, 2}

	b2 = AABB{-2, -2, 0, 0}

	diff := b1.MinkowskiDiff(b2)

	intersects := diff.StabQuery(Vec2f{})

	assert.Equal(t, IntersectAabb(&b1, &b2), intersects, "Do intersect")
}
