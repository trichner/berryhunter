package model

type Updater interface {
	BasicEntity
	Update(dtMillis float32)
}

type Decayer interface {
	Updater
	Decayed() bool
}
