package items

import (
	"encoding/json"
)

type EquipSlot int

const (
	EquipSlotPrimaryHand EquipSlot = iota
	EquipSlotHead
	EquipSlotBreast
	EquipSlotBack
)

var namesEnumEquipSlot = map[string]EquipSlot{
	"PrimaryHand": EquipSlotPrimaryHand,
	"Head":        EquipSlotHead,
	"Breast":      EquipSlotBreast,
	"Back":        EquipSlotBack,
}

type Material struct {
	Item  Item
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
	Recipe *Recipe
}

type ByID []*ItemDefinition

func (a ByID) Len() int           { return len(a) }
func (a ByID) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByID) Less(i, j int) bool { return a[i].ID < a[j].ID }

type Item struct {
	*ItemDefinition
}

// recipe matching the json schema for recipes
type itemDefinition struct {
	ID      int `json:"id"`
	Item    string `json:"item"`
	Factors map[string]int `json:"factors"`
	Slot    string `json:"slot"`

	Recipe struct {
		CraftTicks int `json:"craftTicks"`

		Materials []struct {
			Item  string `json:"item"`
			Count int   `json:"count"`
		} `json:"materials"`

		Tools []string `json:"tools"`
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

func shallowItem(name string) Item {
	return Item{&ItemDefinition{Name: name}}
}

func (i *itemDefinition) mapToItemDefinition() (*ItemDefinition, error) {
	slot := namesEnumEquipSlot[i.Slot]

	// map materials list
	materials := make([]Material, 0)
	for _, v := range i.Recipe.Materials {
		material := Material{
			shallowItem(v.Item),
			v.Count,
		}
		materials = append(materials, material)
	}

	// map tools list
	tools := make([]Tool, 0)
	for _, v := range i.Recipe.Tools {
		_ = v //TODO
		//entityType, err := mapItemIdentifier(v)
		//if err != nil {
		//	return nil, err
		//}
		//tool := Tool{entityType}
		//tools = append(tools, tool)
	}

	return &ItemDefinition{
		ID:     ItemEnum(i.ID),
		Name:   i.Item,
		Slot:   slot,
		Recipe: &Recipe{i.Recipe.CraftTicks, materials, tools},
	}, nil
}
