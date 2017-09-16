package gen

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"math/rand"
)

const gridSize = 100
const chunkSize = 3

func Generate(items items.Registry, rnd *rand.Rand, radius float32) []model.ResourceEntity {

	var steps int64 = int64(radius*2) / chunkSize
	var chunkHalfSize float32 = chunkSize / 2.0
	var chunkQuarterSize float32 = chunkSize / 4.0

	entities := []staticEntityBody{}
	entities = append(entities, trees...)
	entities = append(entities, resources...)

	resourceEntities := make([]model.ResourceEntity, 0, steps*steps)
	for x := int64(0); x < steps; x++ {
		for y := int64(0); y < steps; y++ {
			crnd := chunkRand(x, y, rnd)
			dx := crnd.Float32()*chunkHalfSize + chunkQuarterSize
			dy := crnd.Float32()*chunkHalfSize + chunkQuarterSize
			ex := chunkSize*float32(x) + dx - radius
			ey := chunkSize*float32(y) + dy - radius
			ev := phy.Vec2f{ex, ey}

			// skip out of world entities
			if ev.AbsSq()-chunkSize > radius*radius {
				continue
			}

			e := NewRandomEntityFrom(items, ev, entities, crnd)
			resourceEntities = append(resourceEntities, e)
		}
	}

	return resourceEntities
}

func chunkRand(x, y int64, rnd *rand.Rand) *rand.Rand {

	seed := rnd.Int63() ^ x ^ (y << 32)

	return rand.New(rand.NewSource(seed))
}

var trees = []staticEntityBody{
	{
		BerryhunterApi.EntityTypeRoundTree,
		100,
		1,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Wood",
	},
	{
		BerryhunterApi.EntityTypeMarioTree,
		100,
		1,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Wood",
	},
}

var resources = []staticEntityBody{
	{
		BerryhunterApi.EntityTypeBerryBush,
		100,
		0.5,
		model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Berry",
	},
	{
		BerryhunterApi.EntityTypeStone,
		100,
		0.5,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Stone",
	},
	{
		BerryhunterApi.EntityTypeBronze,
		100,
		0.5,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Bronze",
	},
	{
		BerryhunterApi.EntityTypeIron,
		100,
		0.5,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Iron",
	},
}

type staticEntityBody struct {
	entityType     model.EntityType
	weight         int
	radius         float32
	collisionLayer int
	collisionMask  int
	resourceName   string
}
