package model

type Client interface {
	NextInput() *PlayerInput
	NextJoin() *Join
	SendMessage([]byte) error
}
