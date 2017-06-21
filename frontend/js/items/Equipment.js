"use strict";

define(['items/ItemType'], function (ItemType) {
	let Equipment = {};
	EquipmentSlot.Slots = {
		HAND: 'HAND',

		/**
		 * Virtual slot. Reserved for placeables that are about to be placed.
		 */
		PLACEABLE: 'PLACEABLE'
	};

	EquipmentSlot.Helper = {
		getItemEquipmentSlot: function (item) {
			switch (item.type) {
				case ItemType.EQUIPMENT:
					return item.equipmentSlot;
				case ItemType.PLACEABLE:
					return EquipmentSlot.PLACEABLE;
			}
		}
	};

	return EquipmentSlot;
})