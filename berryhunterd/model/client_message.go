package model

// Models for messages that will be unmarshalled from a 'ClientMessage'
// These are merely structs or type alias holding data.

type Join struct {
	PlayerName string
}

type Cheat struct {
	Token, Command string
}

type ChatMessage string
