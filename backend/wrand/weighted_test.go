package wrand

import (
	"testing"
	"math/rand"
	"fmt"
)

func TestWeightedChoice_Choose(t *testing.T) {

	rnd := rand.New(rand.NewSource(77))

	wc := NewWeightedChoice([]Choice{
		{1, 0},
		{3, 1},
		{6, 2},
	})
	choices := []int{0, 0, 0}
	for i := 0; i < 1000; i++ {
		selected := wc.Choose(rnd)
		choices[selected.(int)]++
	}
	fmt.Printf("choices: %v", choices)
}
