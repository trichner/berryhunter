"use strict";

define([
	'Game',
	'Two',
	'items/Equipment',
	'items/ItemType',
	'UserInterface',
	'schema_client',
], function (Game, Two, Equipment, ItemType, UserInterface) {

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

			this.clickableIcon.onLeftClick = function () {
				if (!this.isFilled()) {
					return;
				}
				switch (this.item.type) {
					case ItemType.EQUIPMENT:
					case ItemType.PLACEABLE:
						let equipmentSlot = Equipment.Helper.getItemEquipmentSlot(this.item);
						if (this.isActive()) {
							this.deactivate();
							this.inventory.deactivateSlot(equipmentSlot);
						} else {
							this.inventory.activateSlot(this.index, equipmentSlot);
						}
						break;
					case ItemType.CONSUMABLE:
						Game.player.controls.onInventoryAction(this.item, BerryhunterApi.ActionType.ConsumeItem);
						break;
				}

			}.bind(this);

			this.clickableIcon.onRightClick = function () {
				if (this.isFilled()) {
					Game.player.controls.onInventoryAction(this.item, BerryhunterApi.ActionType.DropItem);
				}
			}.bind(this);
		}

		/**
		 * @param item
		 * @param count
		 * @return {boolean} whether or not this slot was changed
		 */
		setItem(item, count) {
			if (this.item === item && this.count === count) {
				// Nothing to do
				return false;
			}

			if (count === 0){
				return this.dropItem();
			}

			count = count || 1;
			this.item = item;
			this.clickableIcon.setIconGraphic(item.icon.path);

			this.setCount(count);

			return true;
		}

		setCount(count) {
			this.count = count;
			this.clickableIcon.setCount(count);
		}

		addCount(count) {
			count = count || 1;
			this.setCount(this.count + count);
		}

		/**
		 * @return {boolean} whether or not this slot was changed
		 */
		dropItem() {
			if (!this.isFilled()) {
				// Nothing to do
				return false;
			}

			this.clickableIcon.removeIconGraphic();

			if (this.isActive()) {
				this.inventory.deactivateSlot(Equipment.Helper.getItemEquipmentSlot(this.item));
			}
			this.item = null;
			this.setCount(0);
			this.deactivate();

			return true;
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