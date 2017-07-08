package main

import (
	"math/rand"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/items"
)

const gridSize = 100
const chunkSize = 3

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
			dx := crnd.Float32()*chunkHalfSize + chunkQuarterSize
			dy := crnd.Float32()*chunkHalfSize + chunkQuarterSize
			ex := chunkSize*float32(x) + dx
			ey := chunkSize*float32(y) + dy
			ev := phy.Vec2f{ex, ey}
			e := NewRandomEntityFrom(ev, entities, crnd)
			g.AddResourceEntity(e)
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
		model.LayerStaticCollision | model.LayerRessourceCollision,
		DeathioApi.ItemWood,
	},
	{
		DeathioApi.EntityTypeMarioTree,
		100,
		1,
		model.LayerStaticCollision | model.LayerRessourceCollision,
		DeathioApi.ItemWood,
	},
}

var resources = []staticEntityBody{
	{
		DeathioApi.EntityTypeBerryBush,
		100,
		0.5,
		model.LayerRessourceCollision,
		DeathioApi.ItemBerry,
	},
	{
		DeathioApi.EntityTypeStone,
		100,
		0.5,
		model.LayerStaticCollision | model.LayerRessourceCollision,
		DeathioApi.ItemStone,
	},
	{
		DeathioApi.EntityTypeBronze,
		100,
		0.5,
		model.LayerStaticCollision | model.LayerRessourceCollision,
		DeathioApi.ItemBronze,
	},
}

type staticEntityBody struct {
	entityType     model.EntityType
	weight         int
	radius         float32
	collisionLayer int

	ressource items.ItemEnum
}
