package main

import (
	"math/rand"
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

	for x := int64(0); x < steps; x++ {
		for y := int64(0); y < steps; y++ {
			crnd := chunkRand(x, y, rnd)
			e := NewRandomEntityFrom(entities, crnd)
			dx := crnd.Float32()*chunkHalfSize + chunkQuarterSize
			dy := crnd.Float32()*chunkHalfSize + chunkQuarterSize
			e.SetPosition(
				chunkSize*float32(x)+dx,
				chunkSize*float32(y)+dy)

			g.addEntity(e)
		}
	}

}

func chunkRand(x, y int64, rnd *rand.Rand) *rand.Rand {

	seed := rnd.Int63() ^ x ^ (y << 32)

	return rand.New(rand.NewSource(seed))
}

var trees = []staticEntityBody{
	staticEntityBody{
		typeRoundTree,
		300,
		1,
	},
	staticEntityBody{
		typeMarioTree,
		700,
		2,
	},
}

var resources = []staticEntityBody{
	staticEntityBody{
		typeBerryBush,
		100,
		1,
	},
	staticEntityBody{
		typeStone,
		100,
		1,
	},
	staticEntityBody{
		typeGold,
		100,
		1,
	},
}

type staticEntityBody struct {
	entityType string
	weight     int
	radius     float32
}
