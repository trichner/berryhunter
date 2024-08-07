package main

import (
	"fmt"
	"log"
	"os"
	"sort"

	"github.com/trichner/berryhunter/pkg/berryhunter/items"
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

	r, err := items.RegistryFromPaths(path)
	if err != nil {
		log.Fatalf("Cannot parse items: %s", err)
	}

	parsedItems := r.Items()
	sort.Sort(items.ByID(parsedItems))
	fmt.Printf("Parsed items:\n")
	for _, i := range parsedItems {
		fmt.Printf(" - %2d: %s\n", i.ID, i.Name)
	}
}
