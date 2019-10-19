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
	WhileCarried   []*effects.Effect
	WhileEquipped  []*effects.Effect
	OnConsume      []*effects.Effect
	OnPlacing      []*effects.Effect
	OnHitMob       []*effects.Effect
	OnHitResource  []*effects.Effect
	OnHitPlaceable []*effects.Effect
	OnHitPlayer    []*effects.Effect
	//OnAttackWhileEquipped   []*effects.Effect
	//OnAttackWhileCarried    []*effects.Effect
	//OnHitWhileEquipped      []*effects.Effect
	//OnHitWhileCarried       []*effects.Effect
	//OnBeingHitWhileEquipped []*effects.Effect
	//OnBeingHitWhileCarried  []*effects.Effect

	// For resources:
	// Applied to the yielding player entity
	OnYield []*effects.Effect
	// Applied to the resource entity
	OnYielded []*effects.Effect

	// For placeables:
	// Applied to the attacking player entity
	OnBeingHit []*effects.Effect
	// Applied to player entities in range of the radiator body
	OnRadiatorCollision []*effects.Effect
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
	ID      int                           `json:"id"`
	Type    string                        `json:"type"`
	Name    string                        `json:"name"`
	Factors factors.ItemFactorsDefinition `json:"factors"`
	Effects struct {
		WhileCarried   []string `json:"whileCarried"`
		WhileEquipped  []string `json:"whileEquipped"`
		OnConsume      []string `json:"onConsume"`
		OnPlacing      []string `json:"onPlacing"`
		OnAttack       []string `json:"onAttack"`
		OnHitMob       []string `json:"onHitMob"`
		OnHitResource  []string `json:"onHitResource"`
		OnHitPlaceable []string `json:"onHitPlaceable"`
		OnHitPlayer    []string `json:"onHitPlayer"`
		// OnAttack = applied to attack character
		//OnAttackWhileEquipped []string `json:"onAttackWhileEquipped"`
		//OnAttackWhileCarried  []string `json:"onAttackWhileCarried"`
		//// OnHit = applied to hit entity
		//OnHitWhileEquipped      []string `json:"onHitWhileEquipped"`
		//OnHitWhileCarried       []string `json:"onHitWhileCarried"`
		//OnBeingHitWhileEquipped []string `json:"onBeingHitWhileEquipped"`
		//OnBeingHitWhileCarried  []string `json:"onBeingHitWhileCarried"`

		OnYield   []string `json:"onYield"`
		OnYielded []string `json:"onYielded"`

		OnBeingHit   []string `json:"onBeingHit"`
		OnRadiatorCollision []string `json:"onRadiatorCollision"`
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
	if effectsByEvent.WhileCarried, err = effects.MapEffects(r, i.Effects.WhileCarried); err != nil {
		return nil, err
	}
	if effectsByEvent.WhileEquipped, err = effects.MapEffects(r, i.Effects.WhileEquipped); err != nil {
		return nil, err
	}
	if effectsByEvent.OnConsume, err = effects.MapEffects(r, i.Effects.OnConsume); err != nil {
		return nil, err
	}
	if effectsByEvent.OnPlacing, err = effects.MapEffects(r, i.Effects.OnPlacing); err != nil {
		return nil, err
	}
	if effectsByEvent.OnHitMob, err = effects.MapEffects(r, i.Effects.OnHitMob); err != nil {
		return nil, err
	}
	if effectsByEvent.OnHitPlayer, err = effects.MapEffects(r, i.Effects.OnHitPlayer); err != nil {
		return nil, err
	}
	if effectsByEvent.OnHitPlaceable, err = effects.MapEffects(r, i.Effects.OnHitPlaceable); err != nil {
		return nil, err
	}
	if effectsByEvent.OnHitResource, err = effects.MapEffects(r, i.Effects.OnHitResource); err != nil {
		return nil, err
	}
	//if effectsByEvent.OnAttackWhileEquipped, err = mapEffects(r, i.Effects.OnAttackWhileEquipped); err != nil {
	//	return nil, err
	//}
	//if effectsByEvent.OnAttackWhileCarried, err = mapEffects(r, i.Effects.OnAttackWhileCarried); err != nil {
	//	return nil, err
	//}
	//if effectsByEvent.OnHitWhileEquipped, err = mapEffects(r, i.Effects.OnHitWhileEquipped); err != nil {
	//	return nil, err
	//}
	//if effectsByEvent.OnHitWhileCarried, err = mapEffects(r, i.Effects.OnHitWhileCarried); err != nil {
	//	return nil, err
	//}
	//if effectsByEvent.OnBeingHitWhileEquipped, err = mapEffects(r, i.Effects.OnBeingHitWhileEquipped); err != nil {
	//	return nil, err
	//}
	//if effectsByEvent.OnBeingHitWhileCarried, err = mapEffects(r, i.Effects.OnBeingHitWhileCarried); err != nil {
	//	return nil, err
	//}
	if effectsByEvent.OnYield, err = effects.MapEffects(r, i.Effects.OnYield); err != nil {
		return nil, err
	}
	if effectsByEvent.OnYielded, err = effects.MapEffects(r, i.Effects.OnYielded); err != nil {
		return nil, err
	}
	if effectsByEvent.OnBeingHit, err = effects.MapEffects(r, i.Effects.OnBeingHit); err != nil {
		return nil, err
	}
	if effectsByEvent.OnRadiatorCollision, err = effects.MapEffects(r, i.Effects.OnRadiatorCollision); err != nil {
		return nil, err
	}

	itemType, ok := ItemTypeMap[i.Type]
	if !ok {
		itemType = ItemTypeNone
	}

	return &ItemDefinition{
		ID:      ItemID(i.ID),
		Type:    itemType,
		Name:    i.Name,
		Slot:    slot,
		Factors: factors.MapItemFactors(i.Factors, 0),
		Recipe:  recipe,
		Body:    body,
		Effects: effectsByEvent,
	}, nil
}
