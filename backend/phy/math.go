package phy

import "math"

var VEC2F_ZERO = Vec2f{0, 0}

// acos32f calculates the acos of a float32
func acos32f(f float32) float32 {
	return float32(math.Acos(float64(f)))
}

// sqrt32f calculates the square root of a float32
func sqrt32f(f float32) float32 {
	return float32(math.Sqrt(float64(f)))
}

// Vec2f is a simple 2d float vector
type Vec2f struct {
	X, Y float32
}

// Abs returns the length of a vector
func (v Vec2f) Abs() float32 {
	return sqrt32f(v.X*v.X + v.Y*v.Y)
}

// AbsSq returns the squared length of a vector
func (v Vec2f) AbsSq() float32 {
	return v.X*v.X + v.Y*v.Y
}

// Add adds the vector with another and returns the resulting vector
func (v Vec2f) Add(w Vec2f) Vec2f {
	return Vec2f{v.X + w.X, v.Y + w.Y}
}

// Sub subtracts the vector with another and returns the resulting vector
func (v Vec2f) Sub(w Vec2f) Vec2f {
	return Vec2f{v.X - w.X, v.Y - w.Y}
}

// Mult multiplies the vector with a scalar and returns the resulting vector
func (v Vec2f) Mult(f float32) Vec2f {
	return Vec2f{v.X * f, v.Y * f}
}

// Dot calculates the dot product between two vectors
func (v Vec2f) Dot(w Vec2f) float32 {
	return v.X*w.X + v.Y*w.Y
}

// Mat2f is a simple 2x2 matrix
// [ a b ]
// [ c d ]
type Mat2f struct {
	a, b, c, d float32
}

// Mult multiplies the matrix with a vector and returns the resulting vector
func (m *Mat2f) Mult(f Vec2f) Vec2f {
	x := m.a*f.X + m.b*f.Y
	y := m.c*f.X + m.d*f.Y
	return Vec2f{x, y}
}
