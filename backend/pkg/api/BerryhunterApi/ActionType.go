// Code generated by the FlatBuffers compiler. DO NOT EDIT.

package BerryhunterApi

import "strconv"

type ActionType byte

const (
	ActionTypePrimary     ActionType = 0
	ActionTypeCraftItem   ActionType = 1
	ActionTypeEquipItem   ActionType = 2
	ActionTypeUnequipItem ActionType = 3
	ActionTypeDropItem    ActionType = 4
	ActionTypePlaceItem   ActionType = 5
	ActionTypeConsumeItem ActionType = 6
)

var EnumNamesActionType = map[ActionType]string{
	ActionTypePrimary:     "Primary",
	ActionTypeCraftItem:   "CraftItem",
	ActionTypeEquipItem:   "EquipItem",
	ActionTypeUnequipItem: "UnequipItem",
	ActionTypeDropItem:    "DropItem",
	ActionTypePlaceItem:   "PlaceItem",
	ActionTypeConsumeItem: "ConsumeItem",
}

var EnumValuesActionType = map[string]ActionType{
	"Primary":     ActionTypePrimary,
	"CraftItem":   ActionTypeCraftItem,
	"EquipItem":   ActionTypeEquipItem,
	"UnequipItem": ActionTypeUnequipItem,
	"DropItem":    ActionTypeDropItem,
	"PlaceItem":   ActionTypePlaceItem,
	"ConsumeItem": ActionTypeConsumeItem,
}

func (v ActionType) String() string {
	if s, ok := EnumNamesActionType[v]; ok {
		return s
	}
	return "ActionType(" + strconv.FormatInt(int64(v), 10) + ")"
}