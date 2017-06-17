package phy

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"math"
	"testing"
)

type circleIntersectionTestCase struct {
	name   string
	c1, c2 *Circle
	area   float32
}

var circleIntersectionCases []circleIntersectionTestCase = []circleIntersectionTestCase{
	{
		"full overlap",
		&Circle{Radius: 1},
		&Circle{Radius: 1},
		float32(math.Pi),
	},
	{
		"half overlap right",
		&Circle{Radius: 1},
		NewCircle(Vec2f{1, 0}, 1),
		1.2283697,
	},
	{
		"half overlap top",
		&Circle{Radius: 1},
		NewCircle(Vec2f{0, 1}, 1),
		1.2283697,
	},
	{
		"no overlap",
		&Circle{Radius: 1},
		NewCircle(Vec2f{2, 0}, 1),
		0,
	},
	{
		"a bit overlap",
		&Circle{Radius: 1},
		NewCircle(Vec2f{1.9, 0}, 1),
		0.041846514,
	},
	{
		"a bit more overlap",
		&Circle{Radius: 1},
		NewCircle(Vec2f{1.5, 0}, 1),
		0.4533118,
	},
	{
		"near full overlap",
		&Circle{Radius: 1},
		NewCircle(Vec2f{0.01, 0}, 1),
		3.1215909,
	},
}

func TestCircleIntersectionArea(t *testing.T) {

	for _, test := range circleIntersectionCases {

		a := test.c1.intersectionArea(test.c2)
		fmt.Printf("Overlap: %f for %s\n", a, test.name)
		assert.Equal(t, test.area, a)
	}
}
