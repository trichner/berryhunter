package mobs

import (
	"encoding/json"
	"fmt"
	"github.com/trichner/berryhunter/backend/items"
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
	Vulnerability float32
}

type Drops []*items.ItemStack

type MobDefinition struct {
	ID      MobID
	Name    string
	Type    string
	Factors Factors
	Drops   Drops
}

type mobDefinition struct {
	Id      uint64 `json:"id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Factors struct {
		Vulnerability float32 `json:"vulnerability"`
	} `json:"factors"`
	Drops []struct {
		Item  string `json:"item"`
		Count int    `json:"count"`
	} `json:"drops"`
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

	mob := &MobDefinition{
		ID:   MobID(m.Id),
		Name: m.Name,
		Type: m.Type,
		Factors: Factors{
			Vulnerability: m.Factors.Vulnerability,
		},
		Drops: make(Drops, 0, 1),
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
