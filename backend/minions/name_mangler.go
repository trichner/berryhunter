package minions

import (
	"fmt"
	"math/rand"
)

var numberSuffix = []string{"st", "nd", "rd"}
var adjectiveSuffix = []string{"ugly", "hard", "dump", "crazy", "tall", "lunatic"}
var customSuffix = []string{"breaker of stones", "father of rocks", "bundle of sticks"}

type stringMangler func(s string) (mangled string, next stringMangler)

var DefaultMangler = AdjectiveMangler

func AdjectiveMangler(s string) (string, stringMangler) {
	pick := adjectiveSuffix[rand.Intn(len(adjectiveSuffix))]

	return s + " the " + pick, CustomMangler
}

func CustomMangler(s string) (string, stringMangler) {

	pick := customSuffix[rand.Intn(len(customSuffix))]
	return s + ", " + pick, NewNumberMangler(1)
}

func NewNumberMangler(i int) stringMangler {
	if i <= 0 {
		panic("Only >0 allowed.")
	}

	suffix := "th"
	if i-1 < len(numberSuffix) {
		suffix = numberSuffix[i]
	}

	suffix = fmt.Sprintf("%d%s", i, suffix)
	return func(s string) (string, stringMangler) {

		return s + " " + suffix, NewNumberMangler(i + 1)
	}
}
