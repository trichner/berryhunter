package items

import (
	"encoding/json"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"fmt"
)

type Material struct {
	Item  ItemEnum
	Count int
}

type Tool struct {
	EntityType ItemEnum
}

type Recipe struct {
	Materials []Material
	Tools     []Tool
}
type ItemDefinition struct {
	Item   ItemEnum
	Recipe Recipe
}

// recipe matching the json schema for recipes
type recipe struct {
	Item string `json:"item"`

	Materials []struct {
		Item  string `json:"item"`
		Count int   `json:"count"`
	} `json:"materials"`

	Tools []struct {
		EntityType string `json:"entityType"`
	} `json:"tools"`
}

// parseRecipe parses a json string from a byte array into the
// appropriate recipe object
func parseRecipe(data []byte) (*recipe, error) {
	var r recipe
	err := json.Unmarshal(data, &r)
	if err != nil {
		return nil, err
	}

	return &r, nil
}

var ItemEnumMap = func() map[string]int {

	m := make(map[string]int)
	for enum, str := range DeathioApi.EnumNamesItem {
		m[str] = enum
	}
	return m
}()

func mapItemIdentifier(id string) (ItemEnum, error) {
	enum, ok := ItemEnumMap[id]
	if !ok {
		return DeathioApi.ItemNone, fmt.Errorf("Unknown ItemIdentifier: %s", id)
	}
	return ItemEnum(enum), nil
}

func (r *recipe) mapToItemDefinition() (*ItemDefinition, error) {
	enum, err := mapItemIdentifier(r.Item)
	if err != nil {
		return nil, err
	}

	// map materials list
	materials := make([]Material, 0)
	for _, v := range r.Materials {
		materialEnum, err := mapItemIdentifier(v.Item)
		if err != nil {
			return nil, err
		}
		material := Material{
			materialEnum,
			v.Count,
		}
		materials = append(materials, material)
	}

	// map tools list
	tools := make([]Tool, 0)
	for _, v := range r.Tools {
		entityType, err := mapItemIdentifier(v.EntityType)
		if err != nil {
			return nil, err
		}
		tool := Tool{entityType}
		tools = append(tools, tool)
	}

	return &ItemDefinition{
		Item:   enum,
		Recipe: Recipe{materials, tools},
	}, nil
}
