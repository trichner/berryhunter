package gen

import (
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/model/resource"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/wrand"
	"math/rand"
	"fmt"
)

var _ = model.Interacter(&resource.Resource{})

func NewRandomEntityFrom(items items.Registry, p phy.Vec2f, bodies []staticEntityBody, rnd *rand.Rand) (model.ResourceEntity, error) {
	choices := []wrand.Choice{}
	for _, b := range bodies {
		choices = append(choices, wrand.Choice{Weight: b.weight, Choice: b})
	}

	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(staticEntityBody)
	return NewStaticEntityWithBody(items, p, &selected, rnd)
}

func NewStaticEntityWithBody(items items.Registry, p phy.Vec2f, body *staticEntityBody, rnd *rand.Rand) (model.ResourceEntity, error) {

	resourceItem, err := items.GetByName(body.resourceName)
	if err != nil {

		return nil, fmt.Errorf("unknown ressource: %s", body.resourceName)
		//TODO: errors.WithMessage(err,
		//	fmt.Sprintf("unknown ressource: %s", body.resourceName),
		//	err,
		//)
	}

	if resourceItem.Body == nil {
		return nil, fmt.Errorf("ressource %s has no body", resourceItem.Name)
	}

	// figure out radius
	radius, err := deriveRadius(rnd, resourceItem)
	if err != nil {
		return nil, err
	}

	ball := phy.NewCircle(p, radius)
	ball.Shape().Layer = int(body.collisionLayer)


	r, err := resource.NewResource(ball, splitRandom(rnd, p), resourceItem, body.entityType)
	if err != nil {
		return nil, err
	}
	return r, nil
}

func deriveRadius(rnd *rand.Rand, item items.Item) (float32, error) {

	bodyDefinition := item.Body
	radius := bodyDefinition.Radius
	if radius < 0 {

		return 0, fmt.Errorf("resource %s has invalid radius: 0 <= %f", item.Name, radius)
	}

	if radius > 0 {
		return radius, nil
	}

	minRadius := bodyDefinition.MinRadius
	maxRadius := bodyDefinition.MaxRadius
	if minRadius >= maxRadius || minRadius < 0 {
		return 0, fmt.Errorf(
			"ressource %s has invalid radii: 0 <= %f < %f",
			item.Name, minRadius, maxRadius,
		)
	}
	return rnd.Float32()*(maxRadius-minRadius) + minRadius, nil
}

// TODO is there a better way?
func splitRandom(r *rand.Rand, p phy.Vec2f) *rand.Rand {
	seed := ( int64(p.X) << 32 ) ^ int64(p.Y) ^ r.Int63()
	return rand.New(rand.NewSource(seed))
}
