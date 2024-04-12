package wrand

import (
	"fmt"
	"math/rand"
	"testing"
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

func TestWeightedChoice_Empty(t *testing.T) {
	rnd := rand.New(rand.NewSource(77))

	wc := NewWeightedChoice([]Choice{})
	choices := []int{0, 0, 0}
	for i := 0; i < 1000; i++ {
		selected := wc.Choose(rnd)
		if selected == nil {
			continue
		}
		choices[selected.(int)]++
	}
	fmt.Printf("choices: %v", choices)
}
