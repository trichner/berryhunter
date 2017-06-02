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

			// TODO DEV
			this.slots[0].setItem(Items.Wood, 54);
			this.slots[1].setItem(Items.BronzeSpear);
			this.activateSlot(1);
		}.bind(this);
		two.bind('render', callback);
	}

	activateSlot(slotIndex) {
		for (let i = 0; i < this.slots.length; i++) {
			let slot = this.slots[i];
			if (i === slotIndex) {
				slot.activate();
				this.equipedItem = slot.item;
				this.character.equipItem(this.equipedItem);
			} else {
				slot.deactivate();
			}
		}
	}

	deactivateSlot() {
		this.equipedItem = null;
		this.character.unequipItem();
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
}