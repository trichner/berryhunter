package wrand

import (
	"math/rand"
	"sort"
)

type Choice struct {
	Weight int
	Choice interface{}
}

func NewWeightedChoice(choices []Choice) *WeightedChoice {
	wc := &WeightedChoice{}

	runningTotal := 0

	for _, w := range choices {
		if w.Weight == 0 {
			continue
		}

		runningTotal += w.Weight
		wc.totals = append(wc.totals, runningTotal)
		wc.choices = append(wc.choices, w)
	}

	wc.runningTotal = runningTotal

	return wc
}

type WeightedChoice struct {
	choices      []Choice
	totals       []int
	runningTotal int
}

func (wc *WeightedChoice) Choose(rnd *rand.Rand) interface{} {
	if wc.runningTotal == 0 {
		return nil
	}
	r := rnd.Intn(wc.runningTotal)

	//for _, c := range wc.choices {
	//	r -= c.Weight
	//	if r < 0 {
	//		return c.Choice
	//	}
	//}
	//
	//panic("internal error - code should not reach this point")

	i := sort.Search(len(wc.totals), func(i int) bool { return wc.totals[i] >= r })
	return wc.choices[i].Choice
}
