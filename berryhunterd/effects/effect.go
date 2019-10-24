package effects

import (
	"errors"
	"fmt"
	"github.com/trichner/berryhunter/berryhunterd/model/factors"
	"log"
)

type EffectID uint64
type stackSize uint8

// What's the behavior when the same effect is applied more than once to an EffectStack?
type DurationStacking int

const (
	// Reset duration for all effects of same type to configured value
	Reset DurationStacking = iota
	// Add duration to current duration when adding effect of same type
	Add
	// Adding an effect of the same time doesn't change the time left
	None
)

var durationStackingToID = map[string]DurationStacking{
	"Reset": Reset,
	"Add":   Add,
	"None":  None,
}

// What's the behavior when an effect times out?
type DurationRemoves int

const (
	// All effects of the same type are removed
	All DurationRemoves = iota
	// 1 effect is removed and the duration is reset
	OneByOne
)

var durationRemovesToID = map[string]DurationRemoves{
	"All":      All,
	"OneByOne": OneByOne,
}

type Effect struct {
	ID               EffectID
	Name             string
	MaxStacks        stackSize
	DurationInTicks  int
	DurationStacking DurationStacking
	DurationRemoves  DurationRemoves

	Factors Factors
}

func (e *Effect) String() string {
	return fmt.Sprintf("Effect [%d] \"%s\"", e.ID, e.Name)
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

func (f *Factors) Add(other Factors) {
	f.Vulnerability *= other.Vulnerability

	f.Food *= other.Food
	f.Damage *= other.Damage
	f.StructureDamage *= other.StructureDamage
	f.HeatRadius *= other.HeatRadius
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

func (f *Factors) Subtract(other Factors) error {
	f.Vulnerability /= other.Vulnerability

	f.Food /= other.Food
	f.Damage /= other.Damage
	f.StructureDamage /= other.StructureDamage
	f.HeatRadius /= other.HeatRadius
	f.Vulnerability /= other.Vulnerability
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
	if other.InventoryCap > 0 {
		return errors.New("cannot shrink inventory")
	}

	return nil
}

type activeEffect struct {
	// How many times is the indicated effect in this stack?
	count       stackSize
	ticksLeft   int
	hasDuration bool
}

type EffectStack struct {
	stacks  map[EffectID]*activeEffect
	factors *Factors
}

func NewEffectStack() EffectStack {
	return EffectStack{
		stacks:  make(map[EffectID]*activeEffect),
		factors: NewFactors(),
	}
}

func (es *EffectStack) Factors() *Factors {
	return es.factors
}

func (es *EffectStack) Add(effects []*Effect) {
	for _, e := range effects {
		a, ok := es.stacks[e.ID]
		if !ok {
			a = &activeEffect{
				count:       1,
				ticksLeft:   e.DurationInTicks,
				hasDuration: e.DurationInTicks > 0,
			}
			es.stacks[e.ID] = a
			es.factors.Add(e.Factors)
		} else {
			if e.MaxStacks == 0 || a.count < e.MaxStacks {
				a.count++
				es.factors.Add(e.Factors)
			}
			switch e.DurationStacking {
			case Reset:
				a.ticksLeft = e.DurationInTicks
			case Add:
				a.ticksLeft += e.DurationInTicks
			case None:
				// Do nothing
			default:
				log.Printf("Unknown DurationStacking in %v", e)
			}
		}
	}
}

func (es *EffectStack) Subtract(effects []*Effect) error {
	for _, e := range effects {
		i := es.subtractSingle(e)
		if i != nil {
			return i
		}
	}

	return nil
}

func (es *EffectStack) subtractSingle(e *Effect) error {
	a, exists := es.stacks[e.ID]
	if !exists || a.count == 0 {
		return errors.New("tried to remove effect that is not part of this effect stack")
	}
	a.count--
	if a.count == 0 {
		delete(es.stacks, e.ID)
	}
	if err := es.factors.Subtract(e.Factors); err != nil {
		return err
	}

	return nil
}

func (es *EffectStack) Update(dt float32, r Registry) {
	for id, a := range es.stacks {
		if !a.hasDuration {
			continue
		}

		a.ticksLeft--

		if a.ticksLeft <= 0 {
			// Stack timed out
			e, err := r.Get(id)
			if err != nil {
				log.Printf("Effect timed out, but couldn't be find in registry. %v", err)
				continue
			}

			switch e.DurationRemoves {
			case All:
				for i := 0; i < int(a.count); i++ {
					if err := es.subtractSingle(e); err != nil {
						log.Printf("Couldn't remove full stack on timeout. %v", err)
					}
				}
			case OneByOne:
				if err := es.subtractSingle(e); err != nil {
					log.Printf("Couldn't remove single stack on timeout. %v", err)
				}
				a.ticksLeft = e.DurationInTicks
			default:
				log.Printf("Unknown DurationRemoves in %v", e)
			}
		}
	}
}

type EffectEntity interface {
	EffectStack() *EffectStack
}
