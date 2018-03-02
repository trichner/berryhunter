'use strict';

define([
	'Game',
	'items/Equipment',
	'items/ItemType',
	'userInterface/UserInterface',
	'./InventoryListeners',
	'schema_client',
], function (Game, Equipment, ItemType, UserInterface, InventoryListeners) {

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

				if (this.inventory.isCraftInProgress()) {
					return;
				}

				switch (this.item.type) {
					case ItemType.EQUIPMENT:
					case ItemType.PLACEABLE:
						let equipmentSlot = Equipment.Helper.getItemEquipmentSlot(this.item);
						if (this.isActive()) {
							this.deactivate();
							this.inventory.deactivateSlot(equipmentSlot, true);
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
				if (this.inventory.isCraftInProgress()) {
					return;
				}

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
			if (this.count !== count) {
				this.count = count;
				this.clickableIcon.setCount(count);
				InventoryListeners.notify(this.item.name, count);
			}
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
				this.inventory.deactivateSlot(Equipment.Helper.getItemEquipmentSlot(this.item), false);
			}
			this.setCount(0);
			this.item = null;
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