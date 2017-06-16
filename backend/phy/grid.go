package phy

import (
	"bytes"
	"fmt"
)

type shapes []*circle
type grid map[int]sparseShapesList
type sparseShapesList map[int]shapes

const gridWidth = 10

func floor32f(f float32) int {
	return int(f)
}

func NewSpace() *Space {

	return &Space{
		shapes:       make([]*circle, 0, 16),
		staticShapes: make([]*circle, 0, 16),
		grid:         make(grid),
	}
}

type Space struct {
	shapes       shapes
	staticShapes shapes

	grid       grid
	gridStatic grid
}

func (s *Space) getAt(grid grid, x, y int) shapes {
	yMap := grid[x]
	if yMap == nil {
		return nil
	}

	return yMap[y]
}

func (s *Space) AddShape(c *circle) {
	s.insert(s.grid, c)
}

func (s *Space) AddStaticShape(c *circle) {
	s.insert(s.gridStatic, c)
}

func (s *Space) insert(grid grid, c *circle) {

	bb := c.aabb()
	g := make(map[Vec2i]struct{})

	g[Vec2i{floor32f(bb.l / gridWidth), floor32f(bb.b / gridWidth)}] = struct{}{}
	g[Vec2i{floor32f(bb.l / gridWidth), floor32f(bb.u / gridWidth)}] = struct{}{}

	g[Vec2i{floor32f(bb.r / gridWidth), floor32f(bb.b / gridWidth)}] = struct{}{}
	g[Vec2i{floor32f(bb.r / gridWidth), floor32f(bb.u / gridWidth)}] = struct{}{}

	for k := range g {
		s.insertAt(grid, k.X, k.Y, c)
	}
}

func (s *Space) insertAt(grid grid, x, y int, v *circle) {

	yMap := grid[x]
	if yMap == nil {
		yMap = make(sparseShapesList)
	}

	shapeList := yMap[y]
	if shapeList == nil {
		shapeList = make(shapes, 0, 4)
	}
	shapeList = append(shapeList, v)

	yMap[y] = shapeList
	grid[x] = yMap
}

func (s *Space) String() string {

	var buffer bytes.Buffer

	for x, yMap := range s.grid {
		for y, sparseList := range yMap {

			buffer.WriteString(fmt.Sprintf("%02d-%02d: %+v", x, y, sparseList))
			buffer.WriteString("\t ")
		}
		buffer.WriteString("\n")
	}

	return buffer.String()
}
