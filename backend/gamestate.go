package main

type AabbDTO struct {
	LowerX *float32 `json:"LowerX,omitempty"`
	LowerY *float32 `json:"LowerY,omitempty"`
	UpperX *float32 `json:"UpperY,omitempty"`
	UpperY *float32 `json:"UpperY,omitempty"`
}

type EntityDTO struct {
	Id   uint64  `json:"id"`
	X    float32 `json:"x"`
	Y    float32 `json:"y"`
	Type string  `json:"object"`
	Aabb *AabbDTO `json:"aabb"`
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
