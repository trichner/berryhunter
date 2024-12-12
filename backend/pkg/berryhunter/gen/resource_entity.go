package gen

import (
	"fmt"
	"math/rand"

	"github.com/trichner/berryhunter/pkg/berryhunter/items"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/resource"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
	"github.com/trichner/berryhunter/pkg/berryhunter/wrand"
)

var _ = model.Interacter(&resource.Resource{})

func NewRandomEntityFrom(p phy.Vec2f, bodies []staticEntityBody, rnd *rand.Rand) (model.ResourceEntity, error) {
	choices := []wrand.Choice{}
	for _, b := range bodies {
		choices = append(choices, wrand.Choice{Weight: b.resourceItem.Generator.Weight, Choice: b})
	}

	wc := wrand.NewWeightedChoice(choices)
	selected := wc.Choose(rnd).(staticEntityBody)
	return NewStaticEntityWithBody(p, &selected, rnd)
}

func NewStaticEntityWithBody(p phy.Vec2f, body *staticEntityBody, rnd *rand.Rand) (model.ResourceEntity, error) {
	resourceItem := *body.resourceItem
	if resourceItem.Body == nil {
		return nil, fmt.Errorf("ressource %s has no body", resourceItem.Name)
	}

	// figure out radius
	radius, err := deriveRadius(rnd, resourceItem)
	if err != nil {
		return nil, err
	}

	ball := phy.NewCircle(p, radius)
	if resourceItem.Body.Solid {
		ball.Shape().Layer = int(model.LayerPlayerStaticCollision | model.LayerMobStaticCollision | model.LayerRessourceCollision | model.LayerViewportCollision)
	} else {
		ball.Shape().Layer = int(model.LayerRessourceCollision | model.LayerViewportCollision)
	}

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
	seed := (int64(p.X) << 32) ^ int64(p.Y) ^ r.Int63()
	return rand.New(rand.NewSource(seed))
}
