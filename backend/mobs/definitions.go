package mobs

import "github.com/trichner/berryhunter/backend/items"

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

type Drops []items.ItemStack

type MobDefinition struct {
	ID      MobID
	Name    string
	Type    string
	Factors Factors
	Drops   Drops
}

type mobDefinition struct {
	Id   uint64 `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
	Factors struct {
		Vulnerability float32 `json:"vulnerability"`
	} `json:"factors"`
	Drops []struct {
		Item  string `json:"item"`
		Count int   `json:"count"`
	} `json:"drops"`
}
