package main

import "math/rand"

const gridSize = 100
const chunkSize = 5

func populate(g *Game, rnd *rand.Rand) {

	var steps int64 = gridSize / chunkSize
	var chunkHalfSize float32 = chunkSize / 2.0

	entities := []staticEntityBody{}
	entities = append(entities, foliage...)
	entities = append(entities, resources...)

	for x := int64(0); x < steps; x++ {
		for y := int64(0); y < steps; y++ {
			crnd := chunkRand(x, y, rnd)
			e := NewRandomEntityFrom(foliage, crnd)
			e.SetPosition(
				chunkSize*float32(x)+chunkHalfSize,
				chunkSize*float32(y)+chunkHalfSize)

			g.addEntity(e)

		}
	}

}

func chunkRand(x, y int64, rnd *rand.Rand) *rand.Rand {

	seed := rnd.Int63() ^ x ^ (y << 32)

	return rand.New(rand.NewSource(seed))
}
