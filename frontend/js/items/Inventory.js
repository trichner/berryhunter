class Inventory {
	constructor(character) {
		this.character = character;
		this.equipedItem = null;

		this.height = Relative.height(7);

		this.group = new Two.Group();
		groups.overlay.add(this.group);

		/**
		 *
		 * @type {InventorySlot[]}
		 */
		this.slots = new Array(Constants.INVENTORY_SLOTS);

		let inventoryWidth = this.slots.length * this.height;
		let margin = InventorySlot.margin(this.height);
		inventoryWidth += (this.slots.length - 1) * margin;
		this.group.translation.set(
			centerX - inventoryWidth / 2,
			height - this.height / 2 - margin
		);

		for (let i = 0; i < this.slots.length; i++) {
			this.slots[i] = new InventorySlot(this, i, this.height);
			let slotGroup = this.slots[i].group;
			slotGroup.translation.x += i * (margin + this.height);
			this.group.add(slotGroup)
		}

		let callback = function () {
			this.slots.forEach(function (slot) {
				slot.onDomReady();
			});

			two.unbind('render', callback);
		}.bind(this);
		two.bind('render', callback);
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
	}

	removeItem(item, count) {
		let itemWasRemoved = this.slots.some(function (slot) {
			if (slot.isFilled()) {
				if (slot.item === item) {
					if (slot.count === count) {
						slot.dropItem();
					} else {
						slot.addCount(-count);
						if (slot.isActive()) {
							this.ac
						}
					}
					return true;
				}
			}
		}, this);
		if (!itemWasRemoved) {
			console.warn('Tried to remove ' + count + ' item(s) ' + item.name + ' that were not in inventory.');
		}
	}
}