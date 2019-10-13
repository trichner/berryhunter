package effects

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/trichner/berryhunter/berryhunterd/model/factors"
)

type EffectID uint64
type StackSize uint8

type Effect struct {
	ID              EffectID
	Name            string
	MaxStacks       StackSize
	DurationInTicks int

	Factors Factors
	Addends Addends
}

// Values that get multiplied
type Factors struct {
	factors.VulnerabilityFactors
	factors.ItemFactors
	factors.MobFactors
	factors.PlayerFactors

	CraftingSpeed float32
}

// Values that get added
type Addends struct {
	InventoryCap int
}

func (f Factors) Add(other Factors) {
	f.Vulnerability *= other.Vulnerability

	f.Food *= other.Food
	f.Damage *= other.Damage
	f.StructureDamage *= other.StructureDamage
	f.Yield *= other.Yield
	f.MinYield *= other.MinYield
	f.DurationInTicks *= other.DurationInTicks
	f.HeatPerTick *= other.HeatPerTick
	f.HeatRadius *= other.HeatRadius
	f.Vulnerability *= other.Vulnerability
	f.ReplenishProbability *= other.ReplenishProbability
	f.Capacity *= other.Capacity

	f.DamageFraction *= other.DamageFraction
	f.Speed *= other.Speed
	f.DeltaPhi *= other.DeltaPhi
	f.TurnRate *= other.TurnRate

	f.FreezingDamageTickFraction *= other.FreezingDamageTickFraction
	f.StarveDamageTickFraction *= other.StarveDamageTickFraction
	f.FreezingStarveDamageTickFraction *= other.FreezingStarveDamageTickFraction
	f.SatietyLossTickFraction *= other.SatietyLossTickFraction
	f.HealthGainTick *= other.HealthGainTick
	f.HealthGainSatietyThreshold *= other.HealthGainSatietyThreshold
	f.HealthGainTemperatureThreshold *= other.HealthGainTemperatureThreshold
	f.HealthGainSatietyLossTickFraction *= other.HealthGainSatietyLossTickFraction
	f.WalkingSpeedPerTick *= other.WalkingSpeedPerTick

	f.CraftingSpeed *= other.CraftingSpeed
}

func (a Addends) Add(other Addends) {
	a.InventoryCap += other.InventoryCap
}

func (f Factors) Subtract(other Factors) {
	f.Vulnerability -= other.Vulnerability

	f.Food /= other.Food
	f.Damage /= other.Damage
	f.StructureDamage /= other.StructureDamage
	f.Yield /= other.Yield
	f.MinYield /= other.MinYield
	f.DurationInTicks /= other.DurationInTicks
	f.HeatPerTick /= other.HeatPerTick
	f.HeatRadius /= other.HeatRadius
	f.Vulnerability /= other.Vulnerability
	f.ReplenishProbability /= other.ReplenishProbability
	f.Capacity /= other.Capacity

	f.DamageFraction /= other.DamageFraction
	f.Speed /= other.Speed
	f.DeltaPhi /= other.DeltaPhi
	f.TurnRate /= other.TurnRate

	f.FreezingDamageTickFraction /= other.FreezingDamageTickFraction
	f.StarveDamageTickFraction /= other.StarveDamageTickFraction
	f.FreezingStarveDamageTickFraction /= other.FreezingStarveDamageTickFraction
	f.SatietyLossTickFraction /= other.SatietyLossTickFraction
	f.HealthGainTick /= other.HealthGainTick
	f.HealthGainSatietyThreshold /= other.HealthGainSatietyThreshold
	f.HealthGainTemperatureThreshold /= other.HealthGainTemperatureThreshold
	f.HealthGainSatietyLossTickFraction /= other.HealthGainSatietyLossTickFraction
	f.WalkingSpeedPerTick /= other.WalkingSpeedPerTick

	f.CraftingSpeed /= other.CraftingSpeed
}

func (a Addends) Subtract(other Addends) {
	a.InventoryCap -= other.InventoryCap
}

func (f Factors) test() {
	fmt.Println("Title: ", f.Vulnerability)
}

type EffectStack struct {
	// How many times is the indicated effect in this stack?
	stacks  map[EffectID]StackSize
	factors Factors
	addends Addends
}

func newEffectStack() *EffectStack {
	return &EffectStack{
		stacks:  make(map[EffectID]StackSize),
		factors: Factors{},
	}
}

func (es EffectStack) Add(effects []Effect) {
	for _, e := range effects {
		es.stacks[e.ID]++
		es.factors.Add(e.Factors)
		es.addends.Add(e.Addends)
	}
}

func (es EffectStack) Subtract(effects []Effect) error {
	for _, e := range effects {
		if es.stacks[e.ID] == 0 {
			return errors.New("tried to remove effect that is not part of this effect stack")
		}
		es.stacks[e.ID]--
		es.factors.Subtract(e.Factors)
		es.addends.Subtract(e.Addends)
	}

	return nil
}

type ByID []*Effect

func (a ByID) Len() int           { return len(a) }
func (a ByID) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByID) Less(i, j int) bool { return a[i].ID < a[j].ID }

type factorsDefinition struct {
	factors.ItemFactorsDefinition
	factors.MobFactorsDefinition
	factors.PlayerFactorsDefinition
}

type effectDefinition struct {
	Id          uint64            `json:"id"`
	Name        string            `json:"name"`
	MaxStacks   uint8             `json:"maxStacks"`
	DurationInS int               `json:"durationInSeconds"`
	Factors     factorsDefinition `json:"factors"`
	Addends     struct {
		InventoryCap string `json:"inventoryCap"`
	} `json:"addends"`
}

func parseEffectDefinitions(data []byte) (*[]*effectDefinition, error) {
	var effects []*effectDefinition
	err := json.Unmarshal(data, &effects)
	if err != nil {
		return nil, err
	}

	return &effects, nil
}

func (m *effectDefinition) mapToEffectDefinition() (*Effect, error) {

	effect := &Effect{
		ID:              EffectID(m.Id),
		Name:            m.Name,
		MaxStacks:       StackSize(m.MaxStacks),
		DurationInTicks: factors.DurationInTicks(m.DurationInS),
		Factors: Factors{
			VulnerabilityFactors: factors.Vulnerability(m.Factors.ItemFactorsDefinition.Vulnerability),
			ItemFactors:          factors.MapItemFactors(m.Factors.ItemFactorsDefinition),
			MobFactors:           factors.MapMobFactors(m.Factors.MobFactorsDefinition),
			PlayerFactors:        factors.MapPlayerFactors(m.Factors.PlayerFactorsDefinition),
		},
	}

	return effect, nil
}

//type EffectComponent struct {
//	EffectStack *EffectStack
//}
//
//func NewEffectComponent() *EffectComponent {
//	return &EffectComponent{EffectStack: newEffectStack()}
//}
//
//func (e *EffectComponent) AddEffects(effects []Effect) {
//	e.EffectStack.Add(effects)
//}
//
//func (e *EffectComponent) SubtractEffects(effects []Effect) error {
//	return e.EffectStack.Subtract(effects)
//}

type EffectEntity interface {
	EffectStack() *EffectStack
}
