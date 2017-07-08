package items

import (
	"encoding/json"
	"github.com/trichner/berryhunter/api/schema/DeathioApi"
	"fmt"
)

type EquipSlot int

const (
	EquipSlotPrimaryHand EquipSlot = iota
	EquipSlotHead
	EquipSlotBreast
	EquipSlotBack
)

var NamesEnumEquipSlot = map[string]EquipSlot{
	"PrimaryHand": EquipSlotPrimaryHand,
	"Head":        EquipSlotHead,
	"Breast":      EquipSlotBreast,
	"Back":        EquipSlotBack,
}

type Material struct {
	Item  ItemEnum
	Count int
}

type Tool struct {
	EntityType ItemEnum
}

type Recipe struct {
	CraftTicks int
	Materials  []Material
	Tools      []Tool
}

type ItemDefinition struct {
	ID     ItemEnum
	Name   string
	Slot   EquipSlot
	Recipe Recipe
}

type Item struct {
	*ItemDefinition
}

// recipe matching the json schema for recipes
type itemDefinition struct {

	Item  string `json:"item"`
	Stats map[string]int `json:"stats"`
	Slot  string `json:"slot"`

	Recipe struct {
		CraftTicks int `json:"craftTicks"`

		Materials []struct {
			Item  string `json:"item"`
			Count int   `json:"count"`
		} `json:"materials"`

		Tools []struct {
			EntityType string `json:"entityType"`
		} `json:"tools"`
	} `json:"recipe"`
}

// parseItemDefinition parses a json string from a byte array into the
// appropriate recipe object
func parseItemDefinition(data []byte) (*itemDefinition, error) {
	var i itemDefinition
	err := json.Unmarshal(data, &i)
	if err != nil {
		return nil, err
	}

	return &i, nil
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

func (i *itemDefinition) mapToItemDefinition() (*ItemDefinition, error) {
	enum, err := mapItemIdentifier(i.Item)
	if err != nil {
		return nil, err
	}

	slot := NamesEnumEquipSlot[i.Slot]

	// map materials list
	materials := make([]Material, 0)
	for _, v := range i.Recipe.Materials {
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
	for _, v := range i.Recipe.Tools {
		entityType, err := mapItemIdentifier(v.EntityType)
		if err != nil {
			return nil, err
		}
		tool := Tool{entityType}
		tools = append(tools, tool)
	}

	return &ItemDefinition{
		ID:     enum,
		Name:   i.Item,
		Slot:   slot,
		Recipe: Recipe{i.Recipe.CraftTicks, materials, tools},
	}, nil
}
