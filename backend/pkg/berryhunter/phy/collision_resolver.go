package phy

// CollisionResolver is an interface to resolve collisions
// via double dispatching
type CollisionResolver interface {

	// resolveCollsionWith resolves a collision between
	// itself and another shape
	// returns the reaction force
	resolveCollsionWith(c CollisionResolver) Vec2f

	// resolveCollisionWithCircle resolves the collision between
	// itself and a circle
	// returns the reaction force
	resolveCollisionWithCircle(c *Circle) Vec2f

	// resolveCollisionWithBox resolves the collision between
	// itself and a box
	// returns the reaction force
	resolveCollisionWithInvCircle(c *InvCircle) Vec2f
}
