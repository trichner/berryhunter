package model

// with go get github.com/alvaroloes/enumer
//go:generate enumer -type=CollisionLayer
type CollisionLayer int

const (
	LayerNoneCollision CollisionLayer = 0

	LayerPlayerStaticCollision CollisionLayer = 0x1 << 0 // layer with everything that should collide with a player

	LayerActionCollision    CollisionLayer = 0x1 << 1
	LayerWeaponCollision    CollisionLayer = 0x1 << 2
	LayerRessourceCollision CollisionLayer = 0x1 << 3
	LayerHeatCollision      CollisionLayer = 0x1 << 4
	LayerBorderCollision    CollisionLayer = 0x1 << 5
	LayerViewportCollision  CollisionLayer = 0x1 << 6

	LayerMobStaticCollision CollisionLayer = 0x1 << 7
	LayerPlayerCollision    CollisionLayer = 0x1 << 8 // layer with all players on
)
