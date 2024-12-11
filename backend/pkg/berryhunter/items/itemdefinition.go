package items

import (
	"encoding/json"

	"github.com/trichner/berryhunter/pkg/berryhunter/model/constant"
	"github.com/trichner/berryhunter/pkg/berryhunter/model/vitals"
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
	MinYield        int
	DurationInTicks int

	// Placeable/Heater
	HeatPerTick   uint32
	HeatRadius    float32
	Vulnerability float32

	// Resource
	ReplenishProbability *float32
	Capacity             *int
	StartStock           *float32
}

type Body struct {
	Radius float32
	Solid  bool

	// radii for resources
	MinRadius float32
	MaxRadius float32
}

type DepletionBehavior int

const (
	DepletionBehaviorNone DepletionBehavior = iota
	DepletionBehaviorRespawn
)

var namesEnumDepletionBehavior = map[string]DepletionBehavior{
	"None":    DepletionBehaviorNone,
	"Respawn": DepletionBehaviorRespawn,
}

type Generator struct {
	Weight      int
	Fixed       int
	OnDepletion DepletionBehavior
}

type ItemDefinition struct {
	ID        ItemID
	Type      ItemType
	Name      string
	Slot      EquipSlot
	Factors   Factors
	Resource  *Item
	Recipe    *Recipe
	Body      *Body
	Generator *Generator
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
		MinYield        int     `json:"minimumYield"`
		DurationInS     int     `json:"durationInSeconds"`
		HeatPerSecond   float32 `json:"heatPerSecond"`
		HeatRadius      float32 `json:"heatRadius"`
		Vulnerability   float32 `json:"vulnerability"`

		ReplenishProbabilityPerS *float32 `json:"replenishProbabilityPerSecond"`
		Capacity                 *int     `json:"capacity"`
		StartStock               *float32 `json:"startStock"`
	} `json:"factors"`
	Slot     string `json:"slot"`
	Resource string `json:"resource"`

	Recipe *struct {
		CraftTimeInSeconds int `json:"craftTimeInSeconds"`

		Materials []struct {
			Item  string `json:"item"`
			Count int    `json:"count"`
		} `json:"materials"`

		Tools []string `json:"tools"`
	} `json:"recipe"`

	Body *struct {
		Solid     bool    `json:"solid"`
		Radius    float32 `json:"radius"`
		MinRadius float32 `json:"minRadius"`
		MaxRadius float32 `json:"maxRadius"`
	} `json:"body"`

	Generator *struct {
		Weight      int    `json:"weight"`
		Fixed       int    `json:"fixed"`
		OnDepletion string `json:"onDepletion"`
	} `json:"generator"`
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
		body = &Body{
			Radius:    i.Body.Radius,
			Solid:     i.Body.Solid,
			MinRadius: i.Body.MinRadius,
			MaxRadius: i.Body.MaxRadius,
		}
	}

	var res *Item = nil
	if i.Resource != "" {
		item := shallowItem(i.Resource)
		res = &item
	}

	// parse recipe
	var recipe *Recipe = nil
	if i.Recipe != nil {

		// map tools list
		tools := make([]Tool, 0)
		for _, v := range i.Recipe.Tools {
			_ = v // TODO
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

		craftTicks := i.Recipe.CraftTimeInSeconds * constant.TicksPerSecond
		recipe = &Recipe{craftTicks, materials, tools}
	}

	// parse body
	var generator *Generator = nil
	if i.Generator != nil {
		depletionBehavior := DepletionBehaviorNone
		if i.Generator.OnDepletion != "" {
			depletionBehavior = namesEnumDepletionBehavior[i.Generator.OnDepletion]
		}
		generator = &Generator{
			Weight:      i.Generator.Weight,
			Fixed:       i.Generator.Fixed,
			OnDepletion: depletionBehavior,
		}
	}

	itemType, ok := ItemTypeMap[i.Type]
	if !ok {
		itemType = ItemTypeNone
	}

	var replenishProbability *float32 = nil
	if i.Factors.ReplenishProbabilityPerS != nil {
		rebProb := (*i.Factors.ReplenishProbabilityPerS) / constant.TicksPerSecond
		replenishProbability = &rebProb
	}
	return &ItemDefinition{
		ID:   ItemID(i.ID),
		Type: itemType,
		Name: i.Name,
		Slot: slot,
		Factors: Factors{
			Food:                 i.Factors.Food,
			Damage:               i.Factors.Damage,
			StructureDamage:      i.Factors.StructureDamage,
			Yield:                i.Factors.Yield,
			MinYield:             i.Factors.MinYield,
			HeatPerTick:          vitals.FractionToAbsPerTick(i.Factors.HeatPerSecond),
			HeatRadius:           i.Factors.HeatRadius,
			Vulnerability:        i.Factors.Vulnerability,
			DurationInTicks:      i.Factors.DurationInS * constant.TicksPerSecond,
			ReplenishProbability: replenishProbability,
			Capacity:             i.Factors.Capacity,
			StartStock:           i.Factors.StartStock,
		},
		Resource:  res,
		Recipe:    recipe,
		Body:      body,
		Generator: generator,
	}, nil
}
