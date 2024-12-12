package model

type Respawnee interface {
	Entity
	NeedsRespawn() bool
	ToRespawn() ResourceEntity
}
