package wrand

import (
	"sort"
	"math/rand"
)

type Choice struct {
	Weight int
	Choice interface{}
}

func NewWeightedChoice(choices []Choice) *weightedChoice {
	return &weightedChoice{choices}
}

type weightedChoice struct {
	Choices []Choice
}

func (wc *weightedChoice) Choose(rand *rand.Rand) interface{} {
	totals := []int{}
	running_total := 0

	for _, w := range wc.Choices {
		running_total += w.Weight
		totals = append(totals, running_total)
	}

	rnd := rand.Intn(running_total)
	i := sort.Search(len(totals), func(i int) bool { return totals[i] >= rnd })
	return wc.Choices[i].Choice
}
