package model

type Client interface {
	NextInput() *PlayerInput
	NextJoin() *Join
	NextCheat() *Cheat
	SendMessage([]byte) error
}
