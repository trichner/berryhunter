package phy

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"fmt"
)

func TestSpace_AddShape(t *testing.T) {

	c1 := NewCircle(Vec2f{10, 10}, 5)
	c2 := NewCircle(Vec2f{2, 2}, 1)
	s := NewSpace()

	s.AddShape(c1)
	s.AddShape(c2)

	fmt.Printf("Grid:\n%s\n", s)

	found := s.getAt(s.grid, 11, 11)
	assert.Equal(t, 1, len(found), "Find a shape")
}

func TestSpace_AddStaticShape(t *testing.T) {

}
