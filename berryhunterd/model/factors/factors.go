package factors

import (
	"github.com/trichner/berryhunter/berryhunterd/model/constant"
	"github.com/trichner/berryhunter/berryhunterd/model/vitals"
)

type VulnerabilityFactors struct {
	Vulnerability float32
}

func Vulnerability(v float32) VulnerabilityFactors {
	return VulnerabilityFactors{Vulnerability:v}
}

type ItemFactors struct {
	Food            float32
	Damage          float32
	StructureDamage float32
	Yield           int
	MinYield        int
	DurationInTicks int

	// Placeable/Heater
	HeatPerTick   uint32
	HeatRadius    float32
	VulnerabilityFactors

	// Resource
	ReplenishProbability float32
	Capacity             int
}

func MapItemFactors(d ItemFactorsDefinition) ItemFactors {
	return ItemFactors{
		Food:                 d.Food,
		Damage:               d.Damage,
		StructureDamage:      d.StructureDamage,
		Yield:                d.Yield,
		MinYield:             d.MinYield,
		HeatPerTick:          vitals.FractionToAbsPerTick(d.HeatPerSecond),
		HeatRadius:           d.HeatRadius,
		VulnerabilityFactors: Vulnerability(d.Vulnerability),
		DurationInTicks:      DurationInTicks(d.DurationInS),
		ReplenishProbability: ProbabilityPerTick(d.ReplenishProbabilityPerS),
		Capacity:             d.Capacity,
	}
}

type MobFactors struct {
	VulnerabilityFactors
	DamageFraction float32
	Speed          float32
	DeltaPhi       float32
	TurnRate       float32
}

func MapMobFactors(d MobFactorsDefinition) MobFactors {
	return MobFactors{
		VulnerabilityFactors: Vulnerability(d.Vulnerability),
		DamageFraction: d.DamageFraction,
		Speed:          d.Speed,
		DeltaPhi:       d.DeltaPhi,
		TurnRate:       d.TurnRate,
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



func MapPlayerFactors(d PlayerFactorsDefinition) PlayerFactors {
	return PlayerFactors{
		FreezingDamageTickFraction :        d.FreezingDamageTickFraction,
		HealthGainSatietyLossTickFraction : d.HealthGainSatietyLossTickFraction,
		HealthGainSatietyThreshold :        d.HealthGainSatietyThreshold,
		HealthGainTemperatureThreshold :    d.HealthGainTemperatureThreshold,
		HealthGainTick :                    d.HealthGainTick,
		SatietyLossTickFraction :           d.SatietyLossTickFraction,
		StarveDamageTickFraction :          d.StarveDamageTickFraction,
		FreezingStarveDamageTickFraction :  d.FreezingStarveDamageTickFraction,
		WalkingSpeedPerTick :               d.WalkingSpeedPerTick,
	}
}

func DurationInTicks(d int) int {
	return d * constant.TicksPerSecond
}

func ProbabilityPerTick(p float32) float32 {
	// FIXME https://trello.com/c/cKtO3Rnl/427-replenishprobabilitypersecond-wird-jeden-frame-angewandt-statt-1mal-pro-sec
	return p  / constant.TicksPerSecond
}
