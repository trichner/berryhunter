package factors

import (
	"github.com/trichner/berryhunter/berryhunterd/model/constant"
	"github.com/trichner/berryhunter/berryhunterd/model/vitals"
	"math"
)

type VulnerabilityFactors struct {
	Vulnerability float32
}

func Vulnerability(v float32) VulnerabilityFactors {
	return VulnerabilityFactors{Vulnerability: v}
}

func VulnerabilityWithDefault(v float32, def float32) VulnerabilityFactors {
	return VulnerabilityFactors{Vulnerability: defaultFactorFloat(v, def)}
}

type ItemFactors struct {
	Food            float32
	Damage          float32
	StructureDamage float32
	Yield           int
	MinYield        int
	DurationInTicks int

	// Placeable/Heater
	HeatPerTick uint32
	HeatRadius  float32
	VulnerabilityFactors

	// Resource
	ReplenishProbability float32
	Capacity             int
}

func MapItemFactors(d ItemFactorsDefinition, defaultFloat float32, defaultInt int) ItemFactors {
	return ItemFactors{
		Food:                 defaultFactorFloat(d.Food, defaultFloat),
		Damage:               defaultFactorFloat(d.Damage, defaultFloat),
		StructureDamage:      defaultFactorFloat(d.StructureDamage, defaultFloat),
		Yield:                defaultFactorInt(d.Yield, defaultInt),
		MinYield:             defaultFactorInt(d.MinYield, defaultInt),
		// Special case - value is defaulted (like an int) and then transformed
		HeatPerTick:          vitals.FractionToAbsPerTick(defaultFactorFloat(d.HeatPerSecond, float32(defaultInt))),
		HeatRadius:           defaultFactorFloat(d.HeatRadius, defaultFloat),
		VulnerabilityFactors: Vulnerability(defaultFactorFloat(d.Vulnerability, defaultFloat)),
		DurationInTicks:      defaultFactorInt(DurationInTicks(d.DurationInS), defaultInt),
		ReplenishProbability: defaultFactorFloat(ProbabilityPerTick(d.ReplenishProbabilityPerS), defaultFloat),
		Capacity:             defaultFactorInt(d.Capacity, defaultInt),
	}
}

type MobFactors struct {
	VulnerabilityFactors
	DamageFraction float32
	Speed          float32
	DeltaPhi       float32
	TurnRate       float32
}

func MapMobFactors(d MobFactorsDefinition, defaultFloat float32, defaultInt int) MobFactors {
	return MobFactors{
		VulnerabilityFactors: Vulnerability(defaultFactorFloat(d.Vulnerability, defaultFloat)),
		DamageFraction:       defaultFactorFloat(d.DamageFraction, defaultFloat),
		Speed:                defaultFactorFloat(d.Speed, defaultFloat),
		DeltaPhi:             defaultFactorFloat(d.DeltaPhi, defaultFloat),
		TurnRate:             defaultFactorFloat(d.TurnRate, defaultFloat),
	}
}

type PlayerFactors struct {
	// tickwise loss
	FreezingDamageTickFraction       float32
	StarveDamageTickFraction         float32
	FreezingStarveDamageTickFraction float32
	SatietyLossTickFraction          float32

	// constants for gaining health
	HealthGainTick                    float32
	HealthGainSatietyThreshold        float32
	HealthGainTemperatureThreshold    float32
	HealthGainSatietyLossTickFraction float32

	WalkingSpeedPerTick float32
}

func MapPlayerFactors(d PlayerFactorsDefinition, defaultFloat float32, defaultInt int) PlayerFactors {
	return PlayerFactors{
		FreezingDamageTickFraction:        defaultFactorFloat(d.FreezingDamageTickFraction, defaultFloat),
		HealthGainSatietyLossTickFraction: defaultFactorFloat(d.HealthGainSatietyLossTickFraction, defaultFloat),
		HealthGainSatietyThreshold:        defaultFactorFloat(d.HealthGainSatietyThreshold, defaultFloat),
		HealthGainTemperatureThreshold:    defaultFactorFloat(d.HealthGainTemperatureThreshold, defaultFloat),
		HealthGainTick:                    defaultFactorFloat(d.HealthGainTick, defaultFloat),
		SatietyLossTickFraction:           defaultFactorFloat(d.SatietyLossTickFraction, defaultFloat),
		StarveDamageTickFraction:          defaultFactorFloat(d.StarveDamageTickFraction, defaultFloat),
		FreezingStarveDamageTickFraction:  defaultFactorFloat(d.FreezingStarveDamageTickFraction, defaultFloat),
		WalkingSpeedPerTick:               defaultFactorFloat(d.WalkingSpeedPerTick, defaultFloat),
	}
}

func DurationInTicks(d float32) int {
	return int(math.Round(float64(d) * float64(constant.TicksPerSecond)))
}

func ProbabilityPerTick(p float32) float32 {
	// FIXME https://trello.com/c/cKtO3Rnl/427-replenishprobabilitypersecond-wird-jeden-frame-angewandt-statt-1mal-pro-sec
	return p / constant.TicksPerSecond
}

func defaultFactorFloat(f float32, def float32) float32 {
	if f == 0 {
		return def
	}

	return f
}

func defaultFactorInt(i int, def int) int {
	if i == 0 {
		return def
	}

	return i
}
