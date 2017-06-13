"use strict";

const EquipmentSlot = {
	HAND: 'HAND',

	/**
	 * Virtual slot. Reserved for placeables that are about to be placed.
	 */
	PLACEABLE: 'PLACEABLE'
};

const EquipmentHelper = {
	getItemEquipmentSlot: function (item) {
		switch (item.type) {
			case ItemType.EQUIPMENT:
				return item.equipmentSlot;
			case ItemType.PLACEABLE:
				return EquipmentSlot.PLACEABLE;
		}
	}
};