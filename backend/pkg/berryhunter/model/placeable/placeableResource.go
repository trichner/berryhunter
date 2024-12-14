package placeable

import (
	"fmt"
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/api/BerryhunterApi"
	"github.com/trichner/berryhunter/pkg/berryhunter/gen"
	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/items/mobs"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
	"math/rand"
)

var _ = model.PlaceableEntity(&PlaceableResource{})
var _ = model.ResourceEntity(&PlaceableResource{})

type EmbeddedResource = model.ResourceEntity

type PlaceableResource struct {
	*Placeable
	EmbeddedResource
}

/*
 * There are various overlaps of Placeable and Resource.
 * Rule of thumb: This entity is primarily a Placeable
 * and secondly a resource. Thus, everything that is shared
 * between the two, e.g. HP and status effects, is handled
 * by the placeable, while the resource is doing its unique
 * resource behavior.
 */

func (pr *PlaceableResource) Update(dt float32) {
	pr.Placeable.Update(dt)
	pr.EmbeddedResource.Update(dt)
}

func (pr *PlaceableResource) Decayed() bool {
	return pr.Placeable.Decayed()
}

func (pr *PlaceableResource) HeatRadiation() *model.HeatRadiator {
	return pr.Placeable.HeatRadiation()
}

func (pr *PlaceableResource) StatusEffects() *model.StatusEffects {
	return pr.Placeable.StatusEffects() // Can use either Placeable or Resource effects
}

func (pr *PlaceableResource) PlayerHitsWith(player model.PlayerEntity, item items.Item) {
	pr.Placeable.PlayerHitsWith(player, item)
}

func (pr *PlaceableResource) MobTouches(e model.MobEntity, factors mobs.Factors) {
	pr.Placeable.MobTouches(e, factors)
}

func (pr *PlaceableResource) Item() items.Item {
	return pr.Placeable.Item()
}

func (pr *PlaceableResource) Stock() *model.ResourceStock {
	return pr.EmbeddedResource.Stock()
}

func NewPlaceableResource(item items.Item, resourceItem items.Item) (*PlaceableResource, error) {
	placeable, err := NewPlaceable(item)
	if err != nil {
		return nil, err
	}

	rnd := rand.New(rand.NewSource(int64(placeable.Basic().ID())))
	res, err := gen.NewStaticEntityWithBody(
		placeable.Position(),
		gen.NewStaticEntityBody(
			determineResourceEntityType(resourceItem),
			item.Name,
			&item),
		rnd)
	if err != nil {
		return nil, err
	}

	return &PlaceableResource{
		Placeable:        placeable,
		EmbeddedResource: res,
	}, nil
}

func determineResourceEntityType(stockItem items.Item) model.EntityType {
	switch stockItem.Name {
	case "Berry":
		return model.EntityType(BerryhunterApi.EntityTypeBerryBush)
	}

	panic(fmt.Errorf("no EntityType set up for stock item '%s'", stockItem.Name))
}

func (pr *PlaceableResource) Basic() ecs.BasicEntity {
	return pr.Placeable.Basic()
}

func (pr *PlaceableResource) Bodies() model.Bodies {
	placeableBodies := pr.Placeable.Bodies()
	resourceBodies := pr.EmbeddedResource.Bodies()

	combinedBodies := make(model.Bodies, 0, len(placeableBodies)+len(resourceBodies))

	combinedBodies = append(combinedBodies, placeableBodies...)
	combinedBodies = append(combinedBodies, resourceBodies...)

	return combinedBodies
}

func (pr *PlaceableResource) Type() model.EntityType {
	return pr.Placeable.Type()
}

func (pr *PlaceableResource) Position() phy.Vec2f {
	return pr.Placeable.Position()
}

func (pr *PlaceableResource) SetPosition(p phy.Vec2f) {
	pr.Placeable.SetPosition(p)
}

func (pr *PlaceableResource) AABB() model.AABB {
	return pr.Placeable.AABB()
}

func (pr *PlaceableResource) Angle() float32 {
	return pr.Placeable.Angle()
}

func (pr *PlaceableResource) Radius() float32 {
	return pr.Placeable.Radius()
}
