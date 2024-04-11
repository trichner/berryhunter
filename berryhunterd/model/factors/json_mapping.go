package factors

type MobFactorsDefinition struct {
	Vulnerability  float32 `json:"vulnerability"`
	DamageFraction float32 `json:"damageFraction"`
	Speed          float32 `json:"speed"`
	DeltaPhi       float32 `json:"deltaPhi"`
	TurnRate       float32 `json:"turnRate"`
}

type ItemFactorsDefinition struct {
	Food            float32 `json:"food"`
	Damage          float32 `json:"damage"`
	StructureDamage float32 `json:"structureDamage"`
	Yield           int     `json:"yield"`
	MinYield        int     `json:"minimumYield"`
	DurationInS     float32 `json:"durationInSeconds"`
	HeatPerSecond   float32 `json:"heatPerSecond"`
	HeatRadius      float32 `json:"heatRadius"`
	Vulnerability   float32 `json:"vulnerability"`

	ReplenishProbabilityPerS float32 `json:"replenishProbabilityPerSecond"`
	Capacity                 int     `json:"capacity"`
}

type PlayerFactorsDefinition struct {
	FreezingDamageTickFraction       float32 `json:"freezingDamageTickFraction"`
	StarveDamageTickFraction         float32 `json:"starveDamageTickFraction"`
	FreezingStarveDamageTickFraction float32 `json:"freezingStarveDamageTickFraction"`
	SatietyLossTickFraction          float32 `json:"satietyLossTickFraction"`

	// constants for gaining health
	HealthGainTick                    float32 `json:"healthGainTick"`
	HealthGainSatietyThreshold        float32 `json:"healthGainSatietyThreshold"`
	HealthGainTemperatureThreshold    float32 `json:"healthGainTemperatureThreshold"`
	HealthGainSatietyLossTickFraction float32 `json:"healthGainSatietyLossTickFraction"`

	//
	WalkingSpeedPerTick float32 `json:"walkingSpeedPerTick"`
}
