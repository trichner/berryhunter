package minions

import (
	"fmt"
	"math/rand"
)

var (
	numberSuffix    = []string{"st", "nd", "rd"}
	adjectiveSuffix = []string{"ugly", "hard", "dumb", "crazy", "tall", "lunatic"}
	customSuffix    = []string{
		"breaker of stones",
		"father of rocks",
		"bundle of sticks",
		"first of his name",
		"son of crazy dog",
	}
)

type StringMangler func(s string) (mangled string, next StringMangler)

var DefaultMangler = NewAdjectiveMangler(NewCustomMangler(NewIncrementingNumberMangler(1)))

func NewAdjectiveMangler(next StringMangler) StringMangler {
	return func(s string) (string, StringMangler) {
		pick := adjectiveSuffix[rand.Intn(len(adjectiveSuffix))]

		return s + " the " + pick, next
	}
}

func NewCustomMangler(next StringMangler) StringMangler {
	return func(s string) (string, StringMangler) {
		pick := customSuffix[rand.Intn(len(customSuffix))]
		return s + ", " + pick, next
	}
}

func NewIncrementingNumberMangler(i int) StringMangler {
	if i < 1 {
		panic("Only >0 allowed.")
	}

	suffix := "th"
	idx := i - 1
	if idx < len(numberSuffix) {
		suffix = numberSuffix[idx]
	}

	suffix = fmt.Sprintf(" the %d%s", i, suffix)
	return func(s string) (string, StringMangler) {
		return s + suffix, NewIncrementingNumberMangler(i + 1)
	}
}
