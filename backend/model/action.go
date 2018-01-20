package model

import (
	"github.com/trichner/berryhunter/backend/items"
)

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
	 * Start initiates the action
	 */
	Start()

	/*
	 * Update advances the action by dt milliseconds (1 tick).
	 */
	Update(dt float32)

	/* Ticks returns the number of ticks that are remaining until the action
	 * is finished. Returns 0 if the action is done
	 */
	TicksRemaining() int

	/* Type returns the type of action */
	Type() PlayerActionType

	// Item returns the item associated with the action or nil
	Item() items.Item
}
