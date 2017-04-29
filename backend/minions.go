package main

// Returns the mathematical sgn(f) function,
// 1 for positive, -1 for negative numbers, otherwise 0
func signumf32(f float32) float32 {
	if f < 0 {
		return -1
	}
	if f > 0 {
		return 1
	}
	return 0
}
