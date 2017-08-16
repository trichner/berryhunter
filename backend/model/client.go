package model

type Client interface {
	NextInput() *PlayerInput
	NextJoin() *Join
	NextCheat() *Cheat
	NextChatMessage() *ChatMessage
	SendMessage([]byte) error
}
