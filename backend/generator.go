package main

import (
	"math/rand"
	"github.com/vova616/chipmunk"
	"github.com/trichner/death-io/backend/DeathioApi"
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
	{
		DeathioApi.EntityTypeRoundTree,
		100,
		1,
		staticCollisionLayer | ressourceCollisionLayer,
	},
	{
		DeathioApi.EntityTypeMarioTree,
		100,
		1,
		staticCollisionLayer | ressourceCollisionLayer,
	},
}

var resources = []staticEntityBody{
	{
		DeathioApi.EntityTypeBerryBush,
		100,
		0.5,
		noneCollisionLayer | ressourceCollisionLayer,
	},
	{
		DeathioApi.EntityTypeStone,
		100,
		0.5,
		staticCollisionLayer | ressourceCollisionLayer,
	},
	{
		DeathioApi.EntityTypeBronze,
		100,
		0.5,
		staticCollisionLayer | ressourceCollisionLayer,
	},
}

type staticEntityBody struct {
	entityType     EntityType
	weight         int
	radius         float32
	collisionLayer chipmunk.Layer
}
