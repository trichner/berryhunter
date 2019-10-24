package effects

import (
	"encoding/json"
	"fmt"
	"github.com/trichner/berryhunter/berryhunterd/model/factors"
	"strings"
)

type factorsDefinition struct {
	factors.ItemFactorsDefinition
	factors.MobFactorsDefinition
	factors.PlayerFactorsDefinition
	CraftingSpeed float32 `json:"craftingSpeed"`
	InventoryCap  int     `json:"inventoryCap"`
}

type effectDefinition struct {
	Id               uint64            `json:"id"`
	Name             string            `json:"name"`
	Factors          factorsDefinition `json:"factors"`
	MaxStacks        *uint8            `json:"maxStacks"`
	DurationInS      float32           `json:"durationInSeconds"`
	DurationStacking *string           `json:"durationStacking"`
	DurationRemoves  *string           `json:"durationRemoves"`
}

func parseEffectDefinitions(data []byte) (*[]*effectDefinition, error) {
	var effects []*effectDefinition
	err := json.Unmarshal(data, &effects)
	if err != nil {
		return nil, err
	}

	return &effects, nil
}

func (e *effectDefinition) mapToEffectDefinition() (*Effect, error) {

	durationStacking := Reset
	if e.DurationStacking != nil {
		var ok bool
		if durationStacking, ok = durationStackingToID[*e.DurationStacking]; !ok {
			return nil, fmt.Errorf("invalid DurationStacking '%s' in effect [%d] %s", *e.DurationStacking, e.Id, e.Name)
		}
	}

	durationRemoves := All
	if e.DurationRemoves != nil {
		var ok bool
		if durationRemoves, ok = durationRemovesToID[*e.DurationRemoves]; !ok {
			return nil, fmt.Errorf("invalid DurationRemoves '%s' in effect [%d] %s", *e.DurationRemoves, e.Id, e.Name)
		}
	}

	maxStacks := stackSize(0)
	if e.MaxStacks != nil {
		maxStacks = stackSize(*e.MaxStacks)

		if maxStacks <= 0 {
			return nil, fmt.Errorf("maxStack for effect [%d] %s is smaller than 1", e.Id, e.Name)
		}
	}

	effect := &Effect{
		ID:              EffectID(e.Id),
		Name:            e.Name,
		MaxStacks:       maxStacks,
		DurationInTicks: factors.DurationInTicks(e.DurationInS),
		Factors: Factors{
			VulnerabilityFactors: factors.VulnerabilityWithDefault(e.Factors.ItemFactorsDefinition.Vulnerability, 1),
			ItemFactors:          factors.MapItemFactors(e.Factors.ItemFactorsDefinition, 1, 0),
			MobFactors:           factors.MapMobFactors(e.Factors.MobFactorsDefinition, 1, 0),
			PlayerFactors:        factors.MapPlayerFactors(e.Factors.PlayerFactorsDefinition, 1, 0),
			CraftingSpeed:        e.Factors.CraftingSpeed,
			InventoryCap:         e.Factors.InventoryCap,
		},
		DurationStacking: durationStacking,
		DurationRemoves:  durationRemoves,
	}

	return effect, nil
}

func MapAndValidateEffects(r Registry, eventName string, effectNames []string) ([]*Effect, error) {
	needsDuration := false
	if strings.HasPrefix(eventName, "On") {
		needsDuration = true
	} else if !strings.HasPrefix(eventName, "While") {
		return nil, fmt.Errorf("unknown event type '%s'", eventName)
	}

	var mappedEffects = make([]*Effect, len(effectNames))
	for i, name := range effectNames {
		var err error
		e, err := r.GetByName(name)
		if err != nil {
			return nil, err
		}
		mappedEffects[i] = e

		// validate
		if needsDuration {
			if e.DurationInTicks <= 0 {
				return nil, fmt.Errorf("%v is used in '%s', but events starting with 'On...' require a duration", e, eventName)
			}
		} else if e.DurationInTicks > 0 {
			return nil, fmt.Errorf("%v is used in '%s', but events starting with 'While...' can't have a duration", e, eventName)
		}
	}

	return mappedEffects, nil
}
