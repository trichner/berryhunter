class Inventory {
	constructor(character) {
		this.character = character;
		this.craftableRecipes = [];

		this.height = Relative.height(7);

		this.group = new Two.Group();
		groups.overlay.add(this.group);

		/**
		 *
		 * @type {InventorySlot[]}
		 */
		this.slots = new Array(Constants.INVENTORY_SLOTS);

		let inventoryWidth = this.slots.length * this.height;


		let margin = ClickableIcon.relativeMargin * this.height;
		inventoryWidth += (this.slots.length - 1) * margin;
		this.group.translation.set(
			centerX - inventoryWidth / 2,
			height - this.height / 2 - margin
		);

		for (let i = 0; i < this.slots.length; i++) {
			this.slots[i] = new InventorySlot(this, i, this.height);
			let slotGroup = this.slots[i].clickableIcon;
			slotGroup.translation.x += i * (margin + this.height);
			this.group.add(slotGroup)
		}
	}

	activateSlot(slotIndex, equipementSlot) {
		for (let i = 0; i < this.slots.length; i++) {
			let slot = this.slots[i];
			if (i === slotIndex) {
				slot.activate();
				this.character.equipItem(slot.item, equipementSlot);
			} else {
				slot.deactivate();
			}
		}
	}

	deactivateSlot(equipementSlot) {
		this.character.unequipItem(equipementSlot);
	}

	addItem(item, count) {
		this.slots.some(function (slot) {
			if (slot.isFilled()) {
				if (slot.item === item) {
					slot.addCount(count);
					return true;
				}
			} else {
				slot.setItem(item, count);
				return true;
			}
		});
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
		Crafting.displayAvailableCrafts(this.craftableRecipes);
	}

	getCraftableRecipes() {
		return this.craftableRecipes;
	}
}