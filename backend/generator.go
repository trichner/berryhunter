package main

import (
	"math/rand"
	"fmt"
)

const gridSize = 100
const chunkSize = 5

func populate(g *Game, rnd *rand.Rand) {

	var steps int64 = gridSize / chunkSize
	var chunkHalfSize float32 = chunkSize / 2.0
	var chunkQuarterSize float32 = chunkSize / 4.0

	entities := []staticEntityBody{}
	entities = append(entities, trees...)
	entities = append(entities, resources...)

	fmt.Printf("Entities: %v\n", entities)

	for x := int64(0); x < steps; x++ {
		for y := int64(0); y < steps; y++ {
			crnd := chunkRand(x, y, rnd)
			e := NewRandomEntityFrom(entities, crnd)
			dx := crnd.Float32()*chunkHalfSize + chunkQuarterSize
			dy := crnd.Float32()*chunkHalfSize + chunkQuarterSize
			e.SetPosition(
				chunkSize*float32(x)+dx,
				chunkSize*float32(y)+dy)

			fmt.Printf("Entity: %v\n", e)
			g.addEntity(e)

		}
	}

}

func chunkRand(x, y int64, rnd *rand.Rand) *rand.Rand {

	seed := rnd.Int63() ^ x ^ (y << 32)

	return rand.New(rand.NewSource(seed))
}
