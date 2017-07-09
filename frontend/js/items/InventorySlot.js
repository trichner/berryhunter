"use strict";

define([
	'Two',
	'items/Equipment',
	'items/ItemType',
	'UserInterface'
], function (Two, Equipment, ItemType, UserInterface) {

	class InventorySlot {
		/**
		 *
		 * @param {Inventory} inventory
		 * @param {int} index
		 */
		constructor(inventory, index) {
			this.inventory = inventory;
			this.index = index;

			this.item = null;
			this.count = 0;
			this.active = false;

			this.clickableIcon = UserInterface.getInventorySlot(index);

			this.clickableIcon.onClick = function (event) {
				if (!this.isFilled()) {
					return;
				}
				switch (event.button) {
					// Left Click
					case 0:
						let equipmentSlot = Equipment.Helper.getItemEquipmentSlot(this.item);
						if (this.isActive()) {
							this.deactivate();
							this.inventory.deactivateSlot(equipmentSlot);
						} else {
							this.inventory.activateSlot(this.index, equipmentSlot);
						}
						break;
					case 2:
						// Right Click
						break;
				}
			}.bind(this);
		}

		setItem(item, count) {
			if (this.item === item && this.count === count){
				// Nothing to do
				return;
			}

			count = count || 1;
			this.item = item;
			this.clickableIcon.setIconGraphic(item.icon.path);

			this.setCount(count);

			switch (item.type) {
				case ItemType.EQUIPMENT:
				case ItemType.PLACEABLE:
				case ItemType.CONSUMABLE:
					this.clickableIcon.setClickable(true);
					break;
			}
		}

		setCount(count) {
			this.count = count;
			this.clickableIcon.setCount(count);
		}

		addCount(count) {
			count = count || 1;
			this.setCount(this.count + count);
		}

		dropItem() {
			if (!this.isFilled()){
				// Nothing to do
				return;
			}

			this.clickableIcon.removeIconGraphic();
			this.clickableIcon.setClickable(false);

			if (this.isActive()) {
				this.inventory.deactivateSlot(Equipment.Helper.getItemEquipmentSlot(this.item));
			}
			this.item = null;
			this.setCount(0);
			this.deactivate();
		}

		activate() {
			this.clickableIcon.activate();
			this.active = true;
		}

		deactivate() {
			this.clickableIcon.deactivate();
			this.active = false;
		}

		isActive() {
			return this.active;
		}

		isFilled() {
			return this.item !== null;
		}
	}

	return InventorySlot;
});