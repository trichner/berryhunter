package model

type PlayerActionType int

const (
	PlayerActionPrimary     PlayerActionType = iota
	PlayerActionCraftItem
	PlayerActionEquipItem
	PlayerActionUnequipItem
	PlayerActionDropItem
	PlayerActionPlaceItem
	PlayerActionConsumeItem
)

type PlayerAction interface {
	/*
	 * Start initiates the action and returns `true` if the action is done, otherwise
	 * false.
	 */
	Start() bool

	/*
	 * Update advances the action by dt milliseconds (1 tick). If the return value
	 * is `true`, the action is done, otherwise it will be updated for another tick.
	 */
	Update(dt float32) bool

	/* Ticks returns the number of ticks that have passed since the start */
	TicksRemaining() int

	/* Type returns the type of action */
	Type() PlayerActionType
}
