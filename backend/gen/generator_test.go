package gen

import (
	"fmt"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/wrand"
	"math/rand"
	"testing"
)

func Test_populate(t *testing.T) {

	rnd := rand.New(rand.NewSource(0x1337))
	steps := int64(10)
	for x := int64(0); x < steps; x++ {
		for y := int64(0); y < steps; y++ {
			crnd := chunkRand(x, y, rnd)
			fmt.Printf("Crnd %2d/%2d %f\n", x, y, crnd.Float32())
		}
	}
}

type mockRegistry struct{}

func (*mockRegistry) Get(i items.ItemEnum) (items.Item, error) {
	return items.Item{}, fmt.Errorf("Not implemented")
}

func (*mockRegistry) GetByName(name string) (items.Item, error) {
	return items.Item{}, fmt.Errorf("Not implemented")
}

func (*mockRegistry) Items() []*items.ItemDefinition {
	return make([]*items.ItemDefinition, 0)
}

var _ = items.Registry(&mockRegistry{})

func Test_randomEntity(t *testing.T) {

	entities := []staticEntityBody{}
	entities = append(entities, trees...)
	entities = append(entities, resources...)

	rnd := rand.New(rand.NewSource(1234))
	for y := int64(0); y < 100; y++ {
		e := NewRandomEntityFrom(&mockRegistry{}, phy.Vec2f{}, entities, rnd)
		fmt.Printf("Selected: %v\n", e)
	}

}

func Test_chooseEnity(t *testing.T) {

	entities := []staticEntityBody{}
	entities = append(entities, trees...)
	entities = append(entities, resources...)

	choices := []wrand.Choice{}
	for _, b := range entities {
		choices = append(choices, wrand.Choice{Weight: b.weight, Choice: b})
	}
	fmt.Printf("Choices: %v\n", choices)

	wc := wrand.NewWeightedChoice(choices)

	rnd := rand.New(rand.NewSource(int64(1)))
	for i := 0; i < 10; i++ {
		selected := wc.Choose(rnd).(staticEntityBody)
		fmt.Printf("Selection: %v\n", selected)
	}
}
