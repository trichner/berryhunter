package main

import "github.com/vova616/chipmunk/vect"

type AabbDTO struct {
	LowerX *vect.Float `json:"LowerX"`
	LowerY *vect.Float `json:"LowerY"`
	UpperX *vect.Float `json:"UpperY"`
	UpperY *vect.Float `json:"UpperY"`
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
