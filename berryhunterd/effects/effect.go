package effects

import (
	"encoding/json"
	"errors"
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
	//Addends Addends
}

// Values that get multiplied
type Factors struct {
	factors.VulnerabilityFactors
	factors.ItemFactors
	factors.MobFactors
	factors.PlayerFactors

	CraftingSpeed float32
	InventoryCap  int
}

// Initialize all factors to 1 to allow for easy multiplication
func NewFactors() *Factors {
	return &Factors{
		VulnerabilityFactors: factors.Vulnerability(1),
		ItemFactors: factors.ItemFactors{
			Food:                 1,
			Damage:               1,
			StructureDamage:      1,
			HeatRadius:           1,
			VulnerabilityFactors: factors.Vulnerability(1),
			ReplenishProbability: 1,

			Yield:           0,
			MinYield:        0,
			DurationInTicks: 0,
			HeatPerTick:     0,
			Capacity:        0,
		},
		MobFactors: factors.MobFactors{
			VulnerabilityFactors: factors.Vulnerability(1),
			DamageFraction:       1,
			Speed:                1,
			DeltaPhi:             1,
			TurnRate:             1,
		},
		PlayerFactors: factors.PlayerFactors{
			FreezingDamageTickFraction:        1,
			StarveDamageTickFraction:          1,
			FreezingStarveDamageTickFraction:  1,
			SatietyLossTickFraction:           1,
			HealthGainTick:                    1,
			HealthGainSatietyThreshold:        1,
			HealthGainTemperatureThreshold:    1,
			HealthGainSatietyLossTickFraction: 1,
			WalkingSpeedPerTick:               1,
		},
		CraftingSpeed: 0,
		InventoryCap:  0,
	}
}

// Values that get added
type Addends struct {
}

// All addends are initialized to 0 to allow for easy addition
func NewAddends() *Addends {
	return &Addends{}
}

func (f *Factors) Add(other Factors) {
	f.Vulnerability *= other.Vulnerability

	f.Food *= other.Food
	f.Damage *= other.Damage
	f.StructureDamage *= other.StructureDamage
	f.HeatRadius *= other.HeatRadius
	f.Vulnerability *= other.Vulnerability
	f.ReplenishProbability *= other.ReplenishProbability
	// Sum int values
	f.Yield += other.Yield
	f.MinYield += other.MinYield
	f.DurationInTicks += other.DurationInTicks
	f.HeatPerTick += other.HeatPerTick
	f.Capacity += other.Capacity

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
	// Sum int values
	f.InventoryCap += f.InventoryCap
}

func (a *Addends) Add(other Addends) {
}

func (f *Factors) Subtract(other Factors) {
	f.Vulnerability -= other.Vulnerability

	f.Food /= other.Food
	f.Damage /= other.Damage
	f.StructureDamage /= other.StructureDamage
	f.HeatRadius /= other.HeatRadius
	f.Vulnerability /= other.Vulnerability
	f.ReplenishProbability /= other.ReplenishProbability
	// Subtract int values
	f.Yield -= other.Yield
	f.MinYield -= other.MinYield
	f.DurationInTicks -= other.DurationInTicks
	f.HeatPerTick -= other.HeatPerTick
	f.Capacity -= other.Capacity

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
	// Subtract int values
	//f.InventoryCap -= other.InventoryCap
	if other.InventoryCap > 0 {
		panic("Cannot shrink inventory.")
	}
}

func (a *Addends) Subtract(other Addends) {
}

type EffectStack struct {
	// How many times is the indicated effect in this stack?
	stacks  map[EffectID]StackSize
	factors *Factors
	addends *Addends
}

// func newEffectStack() *EffectStack {
func NewEffectStack() EffectStack {
	return EffectStack{
		stacks:  make(map[EffectID]StackSize),
		factors: NewFactors(),
		addends: NewAddends(),
	}
}

func (es *EffectStack) Factors() *Factors {
	return es.factors
}

func (es *EffectStack) Addends() *Addends {
	return es.addends
}

func (es *EffectStack) Add(effects []*Effect) {
	for _, e := range effects {
		es.stacks[e.ID]++
		es.factors.Add(e.Factors)
		//es.addends.Add(e.Addends)
	}
}

func (es *EffectStack) Subtract(effects []*Effect) error {
	for _, e := range effects {
		if es.stacks[e.ID] == 0 {
			return errors.New("tried to remove effect that is not part of this effect stack")
		}
		es.stacks[e.ID]--
		es.factors.Subtract(e.Factors)
		//es.addends.Subtract(e.Addends)
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
	CraftingSpeed float32 `json:"craftingSpeed"`
	InventoryCap  int     `json:"inventoryCap"`
}

type effectDefinition struct {
	Id          uint64            `json:"id"`
	Name        string            `json:"name"`
	MaxStacks   uint8             `json:"maxStacks"`
	DurationInS int               `json:"durationInSeconds"`
	Factors     factorsDefinition `json:"factors"`
	//Addends     struct {
	//} `json:"addends"`
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
			VulnerabilityFactors: factors.VulnerabilityWithDefault(m.Factors.ItemFactorsDefinition.Vulnerability, 1),
			ItemFactors:          factors.MapItemFactors(m.Factors.ItemFactorsDefinition, 1, 0),
			MobFactors:           factors.MapMobFactors(m.Factors.MobFactorsDefinition, 1, 0),
			PlayerFactors:        factors.MapPlayerFactors(m.Factors.PlayerFactorsDefinition, 1, 0),
			CraftingSpeed:        m.Factors.CraftingSpeed,
			InventoryCap:         m.Factors.InventoryCap,
		},
		//Addends: Addends{
		//},
	}

	return effect, nil
}

func MapEffects(r Registry, effectNames []string) ([]*Effect, error) {
	var mappedEffects = make([]*Effect, len(effectNames))
	for i, name := range effectNames {
		var err error
		mappedEffects[i], err = r.GetByName(name)
		if err != nil {
			return nil, err
		}
	}

	return mappedEffects, nil
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
