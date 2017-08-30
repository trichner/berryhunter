package model

// Client is the interface representing the underlying
// connection to a player/client.
type Client interface {
	// NextInput deques a PlayerInput message received
	// from the client. Returns nil if none available.
	NextInput() *PlayerInput

	// NextJoin deques a Join message received
	// from the client. Returns nil if none available.
	NextJoin() *Join

	// NextCheat deques a Cheat message received
	// from the client. Returns nil if none available.
	NextCheat() *Cheat

	// NextChat deques a Chat message received
	// from the client. Returns nil if none available.
	NextChatMessage() *ChatMessage

	// SendMessage enqueues a message in the outgoing
	// messages queue
	SendMessage([]byte) error

	// Close closes the connection and disconnects the client
	Close()
}
