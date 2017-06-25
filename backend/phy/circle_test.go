package phy

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"math"
	"testing"
	"math/rand"
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

func randomVector(rand *rand.Rand) Vec2f {

	dir := Vec2f{rand.Float32(), rand.Float32()}.Normalize()
	return dir.Mult(5 * rand.Float32())
}

func randomCircle(rand *rand.Rand) *Circle {

	return NewCircle(randomVector(rand), rand.Float32()*4)
}

func TestCircleResolveCircleCollision(t *testing.T) {

	rand := rand.New(rand.NewSource(1))
	var c1, c2 *Circle
	var f1, f2 Vec2f
	for i := 0; i < 100; i++ {
		c1 = randomCircle(rand)
		c2 = randomCircle(rand)

		f1 = resolveCircleThomas(c1, c2)
		f2 = resolveCircleRaoul(c1, c2)

		assert.Equal(t, f1, f2, "Collision resolution matches")
	}
}

type impaleQueryTest struct {
	c *Circle
	s Segment
	e float32
}

var impaleQueryTests []impaleQueryTest = []impaleQueryTest{
	{ // barely hitting
		c: NewCircle(VEC2F_ZERO, 1),
		s: Segment{Vec2f{X: -2}, Vec2f{X: 1}},
		e: 1,
	},
	{ // fully impaling
		c: NewCircle(VEC2F_ZERO, 1),
		s: Segment{Vec2f{X: -2}, Vec2f{X: 2}},
		e: 0.5,
	},
	{ // fall short
		c: NewCircle(VEC2F_ZERO, 1),
		s: Segment{Vec2f{X: -2, Y: 0.5}, Vec2f{X: 1}},
		e: -1,
	},
	{ // impale off-center
		c: NewCircle(VEC2F_ZERO, 1),
		s: Segment{Vec2f{X: -2, Y: 0.5}, Vec2f{X: 2}},
		e: 0.5669873,
	},
	{ // opposite direction
		c: NewCircle(VEC2F_ZERO, 1),
		s: Segment{Vec2f{X: -2, Y: 0}, Vec2f{X: -1}},
		e: -1,
	},
}

func TestCircle_ImpaleQuery(t *testing.T) {
	for _, iqt := range impaleQueryTests {
		d := iqt.c.ImpaleQuery(iqt.s)
		fmt.Printf("D: %f\n", d)
		assert.Equal(t, iqt.e, d, "Impale correctly")
	}

}

