package items

import (
	"encoding/json"
	"github.com/trichner/berryhunter/berryhunterd/effects"
	"github.com/trichner/berryhunter/berryhunterd/model/constant"
	"github.com/trichner/berryhunter/berryhunterd/model/factors"
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

type Body struct {
	Radius float32
	Solid  bool

	// radii for resources
	MinRadius float32
	MaxRadius float32
}

type EffectsByEvent struct {
	WhileCarried            []*effects.Effect
	WhileEquipped           []*effects.Effect
	OnConsume               []*effects.Effect
	OnPlacing               []*effects.Effect
	OnAttackWhileEquipped   []*effects.Effect
	OnAttackWhileCarried    []*effects.Effect
	OnHitWhileEquipped      []*effects.Effect
	OnHitWhileCarried       []*effects.Effect
	OnBeingHitWhileEquipped []*effects.Effect
	OnBeingHitWhileCarried  []*effects.Effect
}

type ItemDefinition struct {
	ID      ItemID
	Type    ItemType
	Name    string
	Slot    EquipSlot
	Factors factors.ItemFactors
	Recipe  *Recipe
	Body    *Body
	Effects *EffectsByEvent
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
	Factors factors.ItemFactorsDefinition `json:"factors"`
	Effects struct {
		WhileCarried []string `json:"whileCarried"`
		WhileEquipped []string `json:"whileEquipped"`
		OnConsume []string `json:"onConsume"`
		OnPlacing []string `json:"onPlacing"`
		// OnAttack = applied to attack character
		OnAttackWhileEquipped []string `json:"onAttackWhileEquipped"`
		OnAttackWhileCarried []string `json:"onAttackWhileCarried"`
		// OnHit = applied to hit entity
		OnHitWhileEquipped []string `json:"onHitWhileEquipped"`
		OnHitWhileCarried []string `json:"onHitWhileCarried"`
		OnBeingHitWhileEquipped []string `json:"onBeingHitWhileEquipped"`
		OnBeingHitWhileCarried []string `json:"onBeingHitWhileCarried"`
	} `json:"effects"`
	Slot string `json:"slot"`

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

func mapEffects(r effects.Registry, effectNames []string) ([]*effects.Effect, error) {
	var mappedEffects = make([]*effects.Effect, len(effectNames))
	for i, name := range effectNames {
		var err error
		mappedEffects[i], err = r.GetByName(name)
		if err != nil {
			return nil, err
		}
	}

	return mappedEffects, nil
}

func (i *itemDefinition) mapToItemDefinition(r effects.Registry) (*ItemDefinition, error) {
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

		craftTicks := i.Recipe.CraftTimeInSeconds * constant.TicksPerSecond
		recipe = &Recipe{craftTicks, materials, tools}
	}

	// Parse effects
	var effectsByEvent = &EffectsByEvent{}
	var err error
	if effectsByEvent.WhileEquipped, err = mapEffects(r, i.Effects.WhileEquipped); err != nil {
		return nil, err
	}
	if effectsByEvent.OnConsume, err = mapEffects(r, i.Effects.OnConsume); err != nil {
		return nil, err
	}
	if effectsByEvent.OnPlacing, err = mapEffects(r, i.Effects.OnPlacing); err != nil {
		return nil, err
	}
	if effectsByEvent.OnAttackWhileEquipped, err = mapEffects(r, i.Effects.OnAttackWhileEquipped); err != nil {
		return nil, err
	}
	if effectsByEvent.OnAttackWhileCarried, err = mapEffects(r, i.Effects.OnAttackWhileCarried); err != nil {
		return nil, err
	}
	if effectsByEvent.OnHitWhileEquipped, err = mapEffects(r, i.Effects.OnHitWhileEquipped); err != nil {
		return nil, err
	}
	if effectsByEvent.OnHitWhileCarried, err = mapEffects(r, i.Effects.OnHitWhileCarried); err != nil {
		return nil, err
	}
	if effectsByEvent.OnBeingHitWhileEquipped, err = mapEffects(r, i.Effects.OnBeingHitWhileEquipped); err != nil {
		return nil, err
	}
	if effectsByEvent.OnBeingHitWhileCarried, err = mapEffects(r, i.Effects.OnBeingHitWhileCarried); err != nil {
		return nil, err
	}
	if effectsByEvent.WhileCarried, err = mapEffects(r, i.Effects.WhileCarried); err != nil {
		return nil, err
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
		Factors: factors.MapItemFactors(i.Factors),
		Recipe: recipe,
		Body:   body,
		Effects: effectsByEvent,
	}, nil
}
