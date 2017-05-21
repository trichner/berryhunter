package main

type EntityDTO struct {
	Id   uint64  `json:"id"`
	X    float32 `json:"x"`
	Y    float32 `json:"y"`
	Type string  `json:"object"`
}

type PlayerDTO struct {
	Id   uint64  `json:"id"`
	X    float32 `json:"x"`
	Y    float32 `json:"y"`
	Type string  `json:"object"`
}

type GameStateDTO struct {
	Tick     uint64       `json:"tick"`
	PlayerID uint64       `json:"player_id"`
	Entities []*EntityDTO `json:"entities"`
}
