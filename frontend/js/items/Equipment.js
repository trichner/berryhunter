'use strict';

define(['items/ItemType'], function (ItemType) {
	let Equipment = {};
	Equipment.Slots = {
		HAND: 'HAND',

		/**
		 * Virtual slot. Reserved for placeables that are about to be placed.
		 */
		PLACEABLE: 'PLACEABLE'
	};

	Equipment.Helper = {
		getItemEquipmentSlot: function (item) {
			switch (item.type) {
				case ItemType.EQUIPMENT:
					return item.equipmentSlot;
				case ItemType.PLACEABLE:
					return Equipment.Slots.PLACEABLE;
			}
		}
	};

	return Equipment;
});