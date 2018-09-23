package model

type Updater interface {
	BasicEntity
	Update(dt float32)
}

type PostUpdater interface {
	BasicEntity
	PostUpdate(dt float32)
}

type PreUpdater interface {
	BasicEntity
	PreUpdate(dt float32)
}
