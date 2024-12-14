package model

//go:generate go run github.com/dmarkham/enumer -type=CollisionLayer
type CollisionLayer int

const LayerNoneCollision CollisionLayer = 0

const (
	LayerPlayerStaticCollision CollisionLayer = 0x1 << iota // layer with everything that should collide with a player

	LayerActionCollision
	LayerWeaponCollision
	LayerRessourceCollision
	LayerHeatCollision
	LayerBorderCollision
	LayerViewportCollision

	LayerMobStaticCollision
	LayerPlayerCollision    // layer with all players on
	LayerPlaceableCollision // layer with all placeables on
)
