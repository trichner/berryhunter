package model

const (
	LayerNoneCollision         = 0
	LayerAllCollision          = -1
	LayerPlayerStaticCollision = 0x1 << 0
	LayerActionCollision       = 0x1 << 1
	LayerWeaponCollision       = 0x1 << 2
	LayerRessourceCollision    = 0x1 << 3
	LayerHeatCollision         = 0x1 << 4
	LayerBorderCollision       = 0x1 << 5
	LayerViewportCollision     = 0x1 << 6
	LayerMobStaticCollision    = 0x1 << 7
)
