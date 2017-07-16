package main

import (
	"github.com/trichner/berryhunter/backend/items"
	"os"
	"fmt"
)

var helpArgs = map[string]bool{
	"-h":     true,
	"--help": true,
	"-?":     true,
}

func main() {

	path := "./"
	if len(os.Args) > 1 {
		arg := os.Args[1]
		if helpArgs[arg] {
			fmt.Printf("Usage: %s [path]\n", os.Args[0])
			fmt.Printf("  path will default to './'\n")
			os.Exit(1)
		}
		path = arg
	}

	r := items.RegistryFromPaths(path)

	fmt.Printf("Parsed items:\n")
	for _, i := range r.Items() {
		fmt.Printf(" - %s\n", i.Name)
	}
}
