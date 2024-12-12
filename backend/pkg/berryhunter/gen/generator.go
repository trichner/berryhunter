package gen

import (
	"fmt"
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

	entities := []StaticEntityBody{}
	entities = append(entities, trees...)
	entities = append(entities, resources...)

	for i := range entities {
		e := &entities[i]
		resourceItem, err := items.GetByName(e.resourceName)
		if err != nil {
			panic(fmt.Errorf("unknown ressource: %s", e.resourceName))
		}

		e.resourceItem = &resourceItem
	}

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

			e, err := NewRandomEntityFrom(ev, entities, crnd)
			if err != nil {
				panic(err)
			}
			resourceEntities = append(resourceEntities, e)
			countEntities = countEntities + 1
		}
	}

	ernd := rand.New(rand.NewSource(rnd.Int63()))
	for _, e := range entities {
		for range e.resourceItem.Generator.Fixed {
			e, err := NewStaticEntityWithBody(NewRandomPos(radius), &e, ernd)
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

func NewRandomPos(radius float32) phy.Vec2f {
	x := NewRandomCoordinate(radius)
	y := NewRandomCoordinate(radius)
	for x*x+y*y > radius*radius {
		x = NewRandomCoordinate(radius)
		y = NewRandomCoordinate(radius)
	}
	return phy.Vec2f{float32(x), float32(y)}
}

func NewRandomCoordinate(radius float32) float32 {
	return rand.Float32()*2*radius - radius
}

var trees = []StaticEntityBody{
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeRoundTree),
		resourceName: "Wood",
	},
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeMarioTree),
		resourceName: "Wood",
	},
}

var resources = []StaticEntityBody{
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeFlower),
		resourceName: "Flower",
	},
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeBerryBush),
		resourceName: "Berry",
	},
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeStone),
		resourceName: "Stone",
	},
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeBronze),
		resourceName: "Bronze",
	},
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeIron),
		resourceName: "Iron",
	},
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeTitanium),
		resourceName: "Titanium",
	},
	{
		entityType:   model.EntityType(BerryhunterApi.EntityTypeTitaniumShard),
		resourceName: "TitaniumShard",
	},
}

type StaticEntityBody struct {
	entityType   model.EntityType
	resourceName string
	resourceItem *items.Item
}

func NewStaticEntityBody(entityType model.EntityType, resourceName string, resourceItem *items.Item) *StaticEntityBody {
	return &StaticEntityBody{entityType: entityType, resourceName: resourceName, resourceItem: resourceItem}
}
