package model

type Client interface {
	NextInput() *PlayerInput
	NextJoin() *Join
	OnDisconnect(h func(Client))
	SendMessage([]byte) error
}
