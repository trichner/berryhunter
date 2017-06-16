package phy

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"math"
	"testing"
)

type circleIntersectionTestCase struct {
	name   string
	c1, c2 circle
	area   float32
}

var circleIntersectionCases []circleIntersectionTestCase = []circleIntersectionTestCase{
	{
		"full overlap",
		circle{radius: 1},
		circle{radius: 1},
		float32(math.Pi),
	},
	{
		"half overlap right",
		circle{radius: 1},
		circle{radius: 1, center: Vec2f{1, 0}},
		1.2283697,
	},
	{
		"half overlap top",
		circle{radius: 1},
		circle{radius: 1, center: Vec2f{0, 1}},
		1.2283697,
	},
	{
		"no overlap",
		circle{radius: 1},
		circle{radius: 1, center: Vec2f{2, 0}},
		0,
	},
	{
		"a bit overlap",
		circle{radius: 1},
		circle{radius: 1, center: Vec2f{1.9, 0}},
		0.041846514,
	},
	{
		"a bit more overlap",
		circle{radius: 1},
		circle{radius: 1, center: Vec2f{1.5, 0}},
		0.4533118,
	},
	{
		"near full overlap",
		circle{radius: 1},
		circle{radius: 1, center: Vec2f{0.01, 0}},
		3.1215909,
	},
}

func TestCircleIntersectionArea(t *testing.T) {

	for _, test := range circleIntersectionCases {

		c2 := &test.c2
		a := test.c1.intersectionArea(c2)
		fmt.Printf("Overlap: %f for %s\n", a, test.name)
		assert.Equal(t, test.area, a)
	}
}
