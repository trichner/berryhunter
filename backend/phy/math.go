package phy

import (
	"fmt"
	"math"
)

var VEC2F_ZERO = Vec2f{0, 0}

// acos32f calculates the acos of a float32
func acos32f(f float32) float32 {
	return float32(math.Acos(float64(f)))
}

// sqrt32f calculates the square root of a float32
func sqrt32f(f float32) float32 {
	return float32(math.Sqrt(float64(f)))
}

// abs32f calculates the 2-norm of a float32
func abs32f(f float32) float32 {
	return float32(math.Abs(float64(f)))
}

// min32f calculates the minimum of two float32 values
func min32f(a, b float32) float32 {
	return float32(math.Min(float64(a), float64(b)))
}

func inf32f(sign int) float32 {
	return float32(math.Inf(sign))
}

// abs32f calculates the 2-norm of a float32
func atan232f(y float32, x float32) float32 {
	return float32(math.Atan2(float64(y), float64(x)))
}

// acos32f calculates the acos of a float32
func sin32f(f float32) float32 {
	return float32(math.Sin(float64(f)))
}

// acos32f calculates the acos of a float32
func cos32f(f float32) float32 {
	return float32(math.Cos(float64(f)))
}

// acos32f calculates the acos of a float32
func Signum32f(f float32) float32 {
	if f < 0 {
		return -1
	}
	if f > 0 {
		return 1
	}
	return 0
}

//==== Vec2f

// Vec2f is a simple 2d float vector
type Vec2f struct {
	X, Y float32
}

func NewPolarVec2f(radius float32, angle float32) Vec2f {
	x := radius * cos32f(angle)
	y := radius * sin32f(angle)
	return Vec2f{x, y}
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

// Div divides the vector with a scalar and returns the resulting vector
func (v Vec2f) Div(f float32) Vec2f {
	return Vec2f{v.X / f, v.Y / f}
}

// Dot calculates the dot product between two vectors
func (v Vec2f) Dot(w Vec2f) float32 {
	return v.X*w.X + v.Y*w.Y
}

// Cross calculates the 2d cross product between two vectors
func (v Vec2f) Cross(w Vec2f) float32 {
	return v.X*w.Y - v.Y*w.X
}

// Rot90 rotates the vector by 90 degrees
func (v Vec2f) Rot90() Vec2f {
	return Vec2f{-v.Y, v.X}
}

// Normalize norms the vector such that it has a length of 1 while
// keeping the direction.
func (v Vec2f) Normalize() Vec2f {
	a := v.Abs()
	x := v.X / a
	y := v.Y / a
	return Vec2f{x, y}
}

func (v Vec2f) DistanceTo(w Vec2f) float32 {
	return w.Sub(v).Abs()
}

func (v Vec2f) DistanceToSquared(w Vec2f) float32 {
	return w.Sub(v).AbsSq()
}

func (v Vec2f) AngleBetween(w Vec2f) float32 {
	atan2 := atan232f(-w.Y, w.X) - atan232f(-v.Y, v.X)
	if atan2 < 0 {
		return float32(math.Pi)*2 + atan2
	}
	return atan2
}

func (v Vec2f) String() string {
	return fmt.Sprintf("%.2f / %.2f", v.X, v.Y)
}

// Mat2f is a simple 2x2 matrix
// [ a b ]
// [ c d ]
type Mat2f struct {
	a, b, c, d float32
}

// Mult multiplies the matrix with a vector and returns the resulting vector
func (m Mat2f) Mult(f Vec2f) Vec2f {
	x := m.a*f.X + m.b*f.Y
	y := m.c*f.X + m.d*f.Y
	return Vec2f{x, y}
}

// String implements the Stringer interface
func (m Mat2f) String() string {
	return fmt.Sprintf("[%f,%f;%f,%f]", m.a, m.b, m.c, m.d)
}

//==== Vec2i

// Vec2i is a simple 2d integer vector
type Vec2i struct {
	X, Y int
}

// Add adds the vector with another and returns the resulting vector
func (v Vec2i) Add(w Vec2i) Vec2i {
	return Vec2i{v.X + w.X, v.Y + w.Y}
}

// Sub subtracts the vector with another and returns the resulting vector
func (v Vec2i) Sub(w Vec2i) Vec2i {
	return Vec2i{v.X - w.X, v.Y - w.Y}
}

// NewRotMat2f create a new rotation matrix with a angle alpha in radians
func NewRotMat2f(alpha float32) Mat2f {
	c := cos32f(alpha)
	s := sin32f(alpha)

	return Mat2f{
		c, -s, s, c,
	}
}
