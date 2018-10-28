package model

// ClientEntity interface represents any connected client i.e. Player or Spectator
type ClientEntity interface {
	BasicEntity
	Client() Client
}
