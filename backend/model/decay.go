package model

type Decayer interface {
	Updater
	Decayed() bool
}
