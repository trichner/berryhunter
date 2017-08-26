package model

type PlayerAction interface {
	Start() bool
	Update(dt float32) bool
}
