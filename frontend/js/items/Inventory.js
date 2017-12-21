"use strict";

define([
	'Game',
	'Utils',
	'Constants',
	'items/Recipes',
	'items/Crafting',
	'items/Equipment',
	'items/InventorySlot',
], function (Game, Utils, Constants, Recipes, Crafting, Equipment, InventorySlot) {
	class Inventory {
		constructor(character, craftInProgress) {
			this.character = character;
			this.craftInProgress = craftInProgress;
			this.craftableRecipes = [];
			this.availableCrafts = [];

			/**
			 *
			 * @type {InventorySlot[]}
			 */
			this.slots = new Array(Constants.INVENTORY_SLOTS);

			for (let i = 0; i < this.slots.length; i++) {
				this.slots[i] = new InventorySlot(this, i);
			}

			// Register movement listener to check for nearby craft requirements
			let super_setPosition = character.setPosition;
			let self = this;
			character.setPosition = function (x, y) {
				if (!super_setPosition.call(this, x, y)) {
					return false;
				}

				if (self.craftableRecipes.length > 0) {
					self.availableCrafts = Recipes.checkNearbys(self.craftableRecipes);
					Crafting.displayAvailableCrafts(self.availableCrafts);
				}

				return true;
			}.bind(character);
		}

		activateSlot(slotIndex, equipmentSlot) {
			// 1st: Deactivate all other slots that match the same equipment slot
			for (let i = 0; i < this.slots.length; i++) {
				let slot = this.slots[i];
				if (i !== slotIndex) {
					if (slot.isFilled()) {
						let itemEquipmentSlot = Equipment.Helper.getItemEquipmentSlot(slot.item);
						if (itemEquipmentSlot === equipmentSlot) {
							slot.deactivate();
							this.deactivateSlot(itemEquipmentSlot, true);
						}
					}
				}
			}

			let slot = this.slots[slotIndex];
			slot.activate();
			if (this.character.equipItem(slot.item, equipmentSlot) &&
				equipmentSlot !== Equipment.Slots.PLACEABLE) {
				Game.player.controls.onInventoryAction(slot.item, BerryhunterApi.ActionType.EquipItem);
			}
		}

		deactivateSlot(equipmentSlot, byUser) {
			let unequippedItem = this.character.unequipItem(equipmentSlot);
			if (byUser && equipmentSlot !== Equipment.Slots.PLACEABLE) {
				Game.player.controls.onInventoryAction(unequippedItem, BerryhunterApi.ActionType.UnequipItem);
			}
		}

		addItem(item, count) {
			let isItemPresent = this.slots.some(function (slot) {
				if (slot.isFilled()) {
					if (slot.item === item) {
						slot.addCount(count);
						return true;
					}
				}
			});
			if (!isItemPresent) {
				this.slots.some(function (slot) {
					if (!slot.isFilled()) {
						slot.setItem(item, count);
						return true;
					}
				})
			}
			this.onChange();
		}

		removeItem(item, count) {
			let itemWasRemoved = this.slots.some(function (slot) {
				if (slot.isFilled()) {
					if (slot.item === item) {
						if (slot.count === count) {
							slot.dropItem();
						} else {
							slot.addCount(-count);
						}
						return true;
					}
				}
			}, this);
			if (!itemWasRemoved) {
				console.warn('Tried to remove ' + count + ' item(s) ' + item.name + ' that were not in inventory.');
			} else {
				this.onChange();
			}
		}

		/**
		 * Method that can be used to unequip any item in the inventory.
		 * The method doesn't care if the item is even in the inventory
		 * or equipped. But if it is, it is unequipped, both in the
		 * inventory and on the character.
		 *
		 * @param item
		 * @param equipmentSlot
		 */
		unequipItem(item, equipmentSlot) {
			this.slots.forEach(function (slot) {
				if (slot.item === item) {
					slot.deactivate();
				}
			});
			this.deactivateSlot(equipmentSlot, false);
		}

		/**
		 * Gets called everytime the items or item count in this inventory get changed.
		 */
		onChange() {
			this.craftableRecipes = Recipes.getCraftableRecipes(this);
			this.availableCrafts = Recipes.checkNearbys(this.craftableRecipes);
			Crafting.displayAvailableCrafts(this.availableCrafts);
		}

		/**
		 * Replaces the current inventory contents with whatever is reported from backend.
		 *
		 * @param {[{item: Item, count: number}]} itemStacks
		 */
		updateFromBackend(itemStacks) {
			let inventoryChanged = false;
			for (let i = 0; i < this.slots.length; ++i) {
				if (Utils.isDefined(itemStacks[i])) {
					inventoryChanged = inventoryChanged || this.slots[i].setItem(itemStacks[i].item, itemStacks[i].count);
				} else {
					inventoryChanged = inventoryChanged || this.slots[i].dropItem();
				}
			}

			if (inventoryChanged) {
				this.onChange();
			}
		}

		clear() {
			this.slots.forEach(slot => {
				slot.dropItem();
			});
			this.onChange();
		}

		/**
		 * Checks if the inventory has enough slots available for a craft with the provided materials.
		 * When the inventory is full, it will also check if a slot gets freed with the craft and thus enough space will
		 * be available.
		 * @param recipeMaterials
		 * @return {boolean}
		 */
		canFitCraft(recipeMaterials) {
			return this.slots.some(function (slot) {
				if (!slot.isFilled()) {
					return true;
				}

				let requiredMaterialCount = recipeMaterials[slot.item.name];
				if (Utils.isUndefined(requiredMaterialCount)) {
					return false;
				}

				if (slot.count < requiredMaterialCount) {
					console.error('Invalid state: ' + requiredMaterialCount + ' ' + slot.item.name +
						' are required for the craft, but only ' + slot.count + ' are in the inventory.');
					// technically, the slot would be free, if the backend for some reason accepts this craft
					return true;
				}
				return requiredMaterialCount === slot.count;
			})
		}
	}

	return Inventory;
});