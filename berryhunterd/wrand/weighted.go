package wrand

import (
	"math/rand"
	"sort"
)

type Choice struct {
	Weight int
	Choice interface{}
}

func NewWeightedChoice(choices []Choice) *weightedChoice {

	wc := &weightedChoice{choices: choices}

	totals := []int{}
	runningTotal := 0

	for _, w := range wc.choices {
		runningTotal += w.Weight
		totals = append(totals, runningTotal)
	}

	wc.totals = totals
	wc.runningTotal = runningTotal

	return wc
}

type weightedChoice struct {
	choices      []Choice
	totals       []int
	runningTotal int
}

func (wc *weightedChoice) Choose(rand *rand.Rand) interface{} {
	if (wc.runningTotal == 0) {
		return nil;
	}
	rnd := rand.Intn(wc.runningTotal)
	i := sort.Search(len(wc.totals), func(i int) bool { return wc.totals[i] >= rnd })
	return wc.choices[i].Choice
}
