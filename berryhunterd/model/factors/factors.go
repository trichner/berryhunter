package factors

import (
	"github.com/trichner/berryhunter/berryhunterd/model/constant"
	"github.com/trichner/berryhunter/berryhunterd/model/vitals"
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

func MapItemFactors(d ItemFactorsDefinition, def int) ItemFactors {
	return ItemFactors{
		Food:                 defaultFactorFloat(d.Food, float32(def)),
		Damage:               defaultFactorFloat(d.Damage, float32(def)),
		StructureDamage:      defaultFactorFloat(d.StructureDamage, float32(def)),
		Yield:                defaultFactorInt(d.Yield, def),
		MinYield:             defaultFactorInt(d.MinYield, def),
		HeatPerTick:          vitals.FractionToAbsPerTick(defaultFactorFloat(d.HeatPerSecond, float32(def))),
		HeatRadius:           defaultFactorFloat(d.HeatRadius, float32(def)),
		VulnerabilityFactors: Vulnerability(defaultFactorFloat(d.Vulnerability, float32(def))),
		DurationInTicks:      defaultFactorInt(DurationInTicks(d.DurationInS), def),
		ReplenishProbability: defaultFactorFloat(ProbabilityPerTick(d.ReplenishProbabilityPerS), float32(def)),
		Capacity:             defaultFactorInt(d.Capacity, def),
	}
}

type MobFactors struct {
	VulnerabilityFactors
	DamageFraction float32
	Speed          float32
	DeltaPhi       float32
	TurnRate       float32
}

func MapMobFactors(d MobFactorsDefinition, def float32) MobFactors {
	return MobFactors{
		VulnerabilityFactors: Vulnerability(defaultFactorFloat(d.Vulnerability, def)),
		DamageFraction:       defaultFactorFloat(d.DamageFraction, def),
		Speed:                defaultFactorFloat(d.Speed, def),
		DeltaPhi:             defaultFactorFloat(d.DeltaPhi, def),
		TurnRate:             defaultFactorFloat(d.TurnRate, def),
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

func MapPlayerFactors(d PlayerFactorsDefinition, def float32) PlayerFactors {
	return PlayerFactors{
		FreezingDamageTickFraction:        defaultFactorFloat(d.FreezingDamageTickFraction, def),
		HealthGainSatietyLossTickFraction: defaultFactorFloat(d.HealthGainSatietyLossTickFraction, def),
		HealthGainSatietyThreshold:        defaultFactorFloat(d.HealthGainSatietyThreshold, def),
		HealthGainTemperatureThreshold:    defaultFactorFloat(d.HealthGainTemperatureThreshold, def),
		HealthGainTick:                    defaultFactorFloat(d.HealthGainTick, def),
		SatietyLossTickFraction:           defaultFactorFloat(d.SatietyLossTickFraction, def),
		StarveDamageTickFraction:          defaultFactorFloat(d.StarveDamageTickFraction, def),
		FreezingStarveDamageTickFraction:  defaultFactorFloat(d.FreezingStarveDamageTickFraction, def),
		WalkingSpeedPerTick:               defaultFactorFloat(d.WalkingSpeedPerTick, def),
	}
}

func DurationInTicks(d int) int {
	return d * constant.TicksPerSecond
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
