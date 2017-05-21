package main

type AabbDTO struct {
	LowerX *float32 `json:"LowerX"`
	LowerY *float32 `json:"LowerY"`
	UpperX *float32 `json:"UpperY"`
	UpperY *float32 `json:"UpperY"`
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
