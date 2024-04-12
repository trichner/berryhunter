package gen

import (
	"log"
	"math/rand"

	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
)

const (
	gridSize          = 100
	chunkSize float32 = 2.7
)

func Generate(items items.Registry, rnd *rand.Rand, radius float32) []model.ResourceEntity {
	var steps int64 = int64(radius * 2 / chunkSize)
	var maximumOffset float32 = 0.9 * chunkSize
	var chunkQuarterSize float32 = chunkSize / 4.0
	var countEntities int64 = 0

	entities := []staticEntityBody{}
	entities = append(entities, trees...)
	entities = append(entities, resources...)

	resourceEntities := make([]model.ResourceEntity, 0, steps*steps)
	for x := int64(0); x < steps; x++ {
		for y := int64(0); y < steps; y++ {
			crnd := chunkRand(x, y, rnd)
			dx := crnd.Float32()*maximumOffset + chunkQuarterSize
			dy := crnd.Float32()*maximumOffset + chunkQuarterSize
			ex := chunkSize*float32(x) + dx - radius
			ey := chunkSize*float32(y) + dy - radius
			ev := phy.Vec2f{ex, ey}

			// skip out of world entities
			if ev.AbsSq()-chunkSize > radius*radius {
				continue
			}

			e, err := NewRandomEntityFrom(items, ev, entities, crnd)
			if err != nil {
				panic(err)
			}
			resourceEntities = append(resourceEntities, e)
			countEntities = countEntities + 1
		}
	}

	log.Printf("%d entities spawned.", countEntities)

	return resourceEntities
}

func chunkRand(x, y int64, rnd *rand.Rand) *rand.Rand {
	seed := rnd.Int63() ^ x ^ (y << 32)

	return rand.New(rand.NewSource(seed))
}

var trees = []staticEntityBody{
	{
		model.EntityType(BerryhunterApi.EntityTypeRoundTree),
		40,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Wood",
	},
	{
		model.EntityType(BerryhunterApi.EntityTypeMarioTree),
		40,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Wood",
	},
}

var resources = []staticEntityBody{
	{
		model.EntityType(BerryhunterApi.EntityTypeFlower),
		18,
		model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Flower",
	},
	{
		model.EntityType(BerryhunterApi.EntityTypeBerryBush),
		6,
		model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Berry",
	},
	{
		model.EntityType(BerryhunterApi.EntityTypeStone),
		20,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Stone",
	},
	{
		model.EntityType(BerryhunterApi.EntityTypeBronze),
		10,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Bronze",
	},
	{
		model.EntityType(BerryhunterApi.EntityTypeIron),
		4,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Iron",
	},
	{
		model.EntityType(BerryhunterApi.EntityTypeTitanium),
		2,
		model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision,
		0,
		"Titanium",
	},
}

type staticEntityBody struct {
	entityType     model.EntityType
	weight         int
	collisionLayer model.CollisionLayer
	collisionMask  int
	resourceName   string
}
