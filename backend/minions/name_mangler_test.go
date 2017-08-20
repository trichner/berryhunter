package minions

import (
	"fmt"
	"testing"
)

func TestMangler(t *testing.T) {

	name := "Jon"

	mangled, mangler := DefaultMangler(name)
	for i := 1; i < 100; i++ {
		fmt.Printf("%2d\t%s\n", i, mangled)
		mangled, mangler = mangler(name)
	}
}
