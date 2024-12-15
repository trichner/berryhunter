package mobs

import (
	"encoding/json"
	"fmt"

	"github.com/trichner/berryhunter/pkg/berryhunter/items"
)

//{
//"id": 1,
//"name": "Dodo",
//"type": "MOB",
//"factors": {
//"vulnerability": 5.0
//},
//"drops": [
//{
//"item": "RawMeat",
//"count": 3
//}
//]
//}

type MobID uint64

type Factors struct {
	Vulnerability           float32
	DamageFraction          float32
	Speed                   float32
	DeltaPhi                float32
	TurnRate                float32
	StructureDamageFraction float32
}

type Body struct {
	Radius         float32
	CollisionLayer int
	CollisionMask  int
	DamageRadius   float32
	Damages        string
}

type RespawnBehavior int

const (
	RespawnBehaviorRandomLocation RespawnBehavior = iota
	RespawnBehaviorProcreation
)

var namesEnumRespawnBehavior = map[string]RespawnBehavior{
	"RandomLocation": RespawnBehaviorRandomLocation,
	"Procreation":    RespawnBehaviorProcreation,
}

type Generator struct {
	Weight          int
	Fixed           int
	RespawnBehavior RespawnBehavior
}

type Drops []*items.ItemStack

type MobDefinition struct {
	ID        MobID
	Name      string
	Type      string
	Factors   Factors
	Drops     Drops
	Body      Body
	Generator Generator
}

type mobDefinition struct {
	Id   uint64 `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`

	Factors struct {
		Vulnerability           float32 `json:"vulnerability"`
		DamageFraction          float32 `json:"damageFraction"`
		StructureDamageFraction float32 `json:"structureDamageFraction"`
		Speed                   float32 `json:"speed"`
		DeltaPhi                float32 `json:"deltaPhi"`
		TurnRate                float32 `json:"turnRate"`
	} `json:"factors"`

	Drops []struct {
		Item  string `json:"item"`
		Count int    `json:"count"`
	} `json:"drops"`

	Body struct {
		Radius         float32 `json:"radius"`
		CollisionLayer int     `json:"collisionLayer"`
		CollisionMask  int     `json:"collisionMask"`
		DamageRadius   float32 `json:"damageRadius"`
		Damages        string  `json:"damages"`
	} `json:"body"`

	Generator struct {
		Weight          int    `json:"weight"`
		Fixed           int    `json:"fixed"`
		RespawnBehavior string `json:"respawnBehavior"`
	} `json:"generator"`
}

// parseItemDefinition parses a json string from a byte array into the
// appropriate recipe object
func parseMobDefinition(data []byte) (*mobDefinition, error) {
	var mob mobDefinition
	err := json.Unmarshal(data, &mob)
	if err != nil {
		return nil, err
	}

	return &mob, nil
}

func (m *mobDefinition) mapToMobDefinition(r items.Registry) (*MobDefinition, error) {
	respawnBehavior := RespawnBehaviorProcreation
	if m.Generator.RespawnBehavior != "" {
		respawnBehavior = namesEnumRespawnBehavior[m.Generator.RespawnBehavior]
	}

	mob := &MobDefinition{
		ID:   MobID(m.Id),
		Name: m.Name,
		Type: m.Type,
		Factors: Factors{
			Vulnerability:           m.Factors.Vulnerability,
			StructureDamageFraction: m.Factors.StructureDamageFraction,
			DamageFraction:          m.Factors.DamageFraction,
			Speed:                   m.Factors.Speed,
			DeltaPhi:                m.Factors.DeltaPhi,
			TurnRate:                m.Factors.TurnRate,
		},
		Drops: make(Drops, 0, 1),
		Body: Body{
			Radius:         m.Body.Radius,
			CollisionLayer: m.Body.CollisionLayer,
			CollisionMask:  m.Body.CollisionMask,
			DamageRadius:   m.Body.DamageRadius,
			Damages:        m.Body.Damages,
		},
		Generator: Generator{
			Weight:          m.Generator.Weight,
			Fixed:           m.Generator.Fixed,
			RespawnBehavior: respawnBehavior,
		},
	}

	// append drops
	for _, d := range m.Drops {
		i, err := r.GetByName(d.Item)
		if err != nil {
			return nil, err
		}
		if d.Count < 1 {
			return nil, fmt.Errorf("Invalid Mob Definition, drop count is %d", d.Count)
		}
		mob.Drops = append(mob.Drops, items.NewItemStack(i, d.Count))
	}

	return mob, nil
}
