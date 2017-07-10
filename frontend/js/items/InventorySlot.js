"use strict";

define([
	'Game',
	'Two',
	'items/Equipment',
	'items/ItemType',
	'UserInterface',
	'Controls',
	'schema_client',
], function (Game, Two, Equipment, ItemType, UserInterface, Controls) {

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
				let equipmentSlot = Equipment.Helper.getItemEquipmentSlot(this.item);
				if (this.isActive()) {
					this.deactivate();
					this.inventory.deactivateSlot(equipmentSlot);
				} else {
					this.inventory.activateSlot(this.index, equipmentSlot);
				}
			}.bind(this);

			this.clickableIcon.onRightClick = function () {
				if (this.isFilled()) {
					Game.player.controls.onInventoryAction(this.item, DeathioApi.ActionType.DropItem);
				}
			}.bind(this);
		}

		setItem(item, count) {
			if (this.item === item && this.count === count) {
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
			if (!this.isFilled()) {
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