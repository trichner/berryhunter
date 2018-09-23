package items

type ItemType int

const (
	ItemTypeNone ItemType = iota
	ItemTypePlaceable
	ItemTypeResource
	ItemTypeEquipment
	ItemTypeConsumable
)

var ItemTypeMap = map[string]ItemType{
	"PLACEABLE":  ItemTypePlaceable,
	"RESOURCE":   ItemTypeResource,
	"EQUIPMENT":  ItemTypeEquipment,
	"CONSUMABLE": ItemTypeConsumable,
}
