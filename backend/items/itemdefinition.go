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

type Tool struct {
	EntityType ItemID
}

type Recipe struct {
	CraftTicks int
	Materials  []*ItemStack
	Tools      []Tool
}

type Factors struct {
	Food            float32
	Damage          float32
	StructureDamage float32
	Yield           int
	DurationInS     int

	Warmth float32
	Radius float32
}

type Body struct {
	Radius float32
	Layer  int
}

type ItemDefinition struct {
	ID      ItemID
	Type    ItemType
	Name    string
	Slot    EquipSlot
	Factors Factors
	Recipe  *Recipe
	Body    *Body
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
	ID      int    `json:"id"`
	Type    string `json:"type"`
	Name    string `json:"name"`
	Factors struct {
		Food            float32 `json:"food"`
		Damage          float32 `json:"damage"`
		StructureDamage float32 `json:"structureDamage"`
		Yield           int     `json:"yield"`
		DurationInS     int     `json:"durationInSeconds"`
		Warmth          float32 `json:"warmth"`
		Radius          float32 `json:"radius"`
	} `json:"factors"`
	Slot string `json:"slot"`

	Recipe *struct {
		CraftTicks int `json:"craftTicks"`

		Materials []struct {
			Item  string `json:"item"`
			Count int    `json:"count"`
		} `json:"materials"`

		Tools []string `json:"tools"`
	} `json:"recipe"`

	Body *struct {
		Layer  int     `json:"layer"`
		Radius float32 `json:"radius"`
	} `json:"body"`
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

	// parse body
	var body *Body = nil
	if i.Body != nil {
		body = &Body{Radius: i.Body.Radius, Layer: i.Body.Layer}
	}

	// parse recipe
	var recipe *Recipe = nil
	if i.Recipe != nil {

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

		// map materials list
		materials := make([]*ItemStack, 0)
		for _, v := range i.Recipe.Materials {
			material := &ItemStack{
				shallowItem(v.Item),
				v.Count,
			}
			materials = append(materials, material)
		}

		recipe = &Recipe{i.Recipe.CraftTicks, materials, tools}
	}

	itemType, ok := ItemTypeMap[i.Type]
	if !ok {
		itemType = ItemTypeNone
	}

	return &ItemDefinition{
		ID:   ItemID(i.ID),
		Type: itemType,
		Name: i.Name,
		Slot: slot,
		Factors: Factors{
			Food:            i.Factors.Food,
			Damage:          i.Factors.Damage,
			StructureDamage: i.Factors.StructureDamage,
			Yield:           i.Factors.Yield,
			Warmth:          i.Factors.Warmth,
			Radius:          i.Factors.Radius,
			DurationInS:     i.Factors.DurationInS,
		},
		Recipe: recipe,
		Body:   body,
	}, nil
}
