"use strict";

define(['Game', 'Two', 'Utils', 'Constants', 'items/ClickableIcon', 'items/RecipesHelper', 'items/Crafting', 'items/Equipment'],
	function (Game, Two, Utils, Constants, ClickableIcon, RecipesHelper, Crafting) {
		class Inventory {
			constructor(character) {
				this.character = character;
				this.craftableRecipes = [];
				this.availableCrafts = [];

				this.height = Utils.Relative.height(7);

				this.group = new Two.Group();
				Game.groups.overlay.add(this.group);

				/**
				 *
				 * @type {InventorySlot[]}
				 */
				this.slots = new Array(Constants.INVENTORY_SLOTS);

				let margin = ClickableIcon.relativeMargin * this.height;
				let inventoryWidth = (this.slots.length - 1) * (this.height + margin);

				this.group.translation.set(
					Game.centerX - inventoryWidth / 2,
					Game.height - this.height / 2 - margin
				);

				for (let i = 0; i < this.slots.length; i++) {
					this.slots[i] = new InventorySlot(this, i, this.height);
					let slotGroup = this.slots[i].clickableIcon;
					slotGroup.translation.x += i * (margin + this.height);
					this.group.add(slotGroup)
				}

				// Register movement listener to check for nearby craft requirements
				let super_setPosition = character.setPosition;
				let self = this;
				character.setPosition = function (x, y) {
					super_setPosition.call(this, x, y);
					if (self.craftableRecipes.length > 0) {
						self.availableCrafts = RecipesHelper.checkNearbys(self.craftableRecipes);
						Crafting.displayAvailableCrafts(self.availableCrafts);
					}
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
								this.deactivateSlot(itemEquipmentSlot);
							}
						}
					}
				}

				let slot = this.slots[slotIndex];
				slot.activate();
				this.character.equipItem(slot.item, equipmentSlot);
			}

			deactivateSlot(equipmentSlot) {
				this.character.unequipItem(equipmentSlot);
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
			 * Gets called everytime the items or item count in this inventory get changed.
			 */
			onChange() {
				this.craftableRecipes = RecipesHelper.getCraftableRecipes(this);
				this.availableCrafts = RecipesHelper.checkNearbys(this.craftableRecipes);
				Crafting.displayAvailableCrafts(this.availableCrafts);
			}
		}

		return Inventory;
	});