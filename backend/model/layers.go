package model

const (
	LayerNoneCollision      = 0
	LayerAllCollision       = -1
	LayerStaticCollision    = 0x1 << 0
	LayerActionCollision    = 0x1 << 1
	LayerWeaponCollision    = 0x1 << 2
	LayerRessourceCollision = 0x1 << 3
)