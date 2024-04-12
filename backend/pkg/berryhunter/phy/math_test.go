package phy

import (
	"math"
	"testing"

	"github.com/stretchr/testify/assert"
)

type angleTest struct {
	a, b  Vec2f
	angle float32
}

var angleTests = []angleTest{
	{Vec2f{1, 0}, Vec2f{0, 1}, 0.5 * math.Pi},
	{Vec2f{1, 0}, Vec2f{1, 1}, 0.25 * math.Pi},
	{Vec2f{1, 0}, Vec2f{-1, 0}, math.Pi},
	{Vec2f{1, 0}, Vec2f{0, -1}, 1.5 * math.Pi},
	{Vec2f{1, 0}, Vec2f{1, -1}, 1.75 * math.Pi},
}

const angleEpsilon = 0.00001

func TestVec2f_AngleBetween(t *testing.T) {
	for _, c := range angleTests {
		a := c.a.AngleBetween(c.b)
		e := abs32f(c.angle - a)
		assert.True(t, e <= angleEpsilon, "Angles should match: %f != %f.", c.angle, a)
	}
}
