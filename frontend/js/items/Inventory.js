/**
 * Created by XieLong on 21.05.2017.
 */
class InventorySlot {
	/**
	 *
	 * @param {Inventory} inventory
	 * @param {int} index
	 * @param {int} size
	 */
	constructor(inventory, index, size) {
		this.inventory = inventory;
		this.index = index;
		this.size = size;

		/**
		 *
		 * @type {{
					iconFile: String,
					type: ItemType,
					svg: Node
				}}
		 */
		this.item = null;
		this.count = 0;
		this.active = false;

		this.group = new Two.Group();
		this.background = new Two.RoundedRectangle(0, 0, size, size, size * 0.1);
		this.group.add(this.background);
		this.background.noStroke();
		this.background.fill = InventorySlot.backgroundColors.empty;

		// let countGroup = new Two.Group();
		// this.group.add(countGroup);
		// countGroup.translation.set(
		// 	this.size
		// )


		let fontSize = this.size * 0.25;
		this.countText =
			new Two.Text(0,
				this.size * (0.5 - InventorySlot.relativePadding) - fontSize / 2,
				this.size * (0.5 - InventorySlot.relativePadding) - fontSize / 2,
				{
					visible: false,
					fill: InventorySlot.countColors.font,
					// stroke : InventorySlot.countColors.outline,
					// linewidth: 0.5,
					size: fontSize
				});
		this.group.add(this.countText);
	}

	onDomReady() {
		this.domElement = this.group._renderer.elem;
		this.domElement.addEventListener('pointerup', function (event) {
			event.stopPropagation();
		});
		this.domElement.addEventListener('pointerdown', function (event) {
			event.stopPropagation();
		});
		this.domElement.addEventListener('click', function (event) {
			switch (event.button) {
				case 0:
					// Left Click
					if (this.isFilled() && this.item.type === ItemType.EQUIPMENT) {
						if (this.isActive()) {
							this.deactivate();
							this.inventory.deactivateSlot();
						} else {
							this.inventory.activateSlot(this.index);
						}
					}
					break;
				case 2:
					// Right Click
					break;
			}
			event.stopPropagation();
		}.bind(this));
	}

	static margin(size) {
		return InventorySlot.relativeMargin * size;
	}

	/**
	 *
	 * @param {{
					iconFile: String,
					type: ItemType,
					svg: Node
				}} item
	 * @param {Number} count
	 */
	setItem(item, count) {
		this.count = count || 1;
		this.item = item;
		this.itemIcon =
			new InjectedSVG(
				item.icon.svg,
				0, 0,
				this.size * (0.5 - InventorySlot.relativePadding));
		this.group.add(this.itemIcon);
		this.background.fill = InventorySlot.backgroundColors.filled;

		if (this.count === 1) {
			this.countText.visible = false;
		} else {
			this.countText.visible = true;
			this.countText.value = this.count;
		}

		if (item.type === ItemType.EQUIPMENT) {
			this.domElement.classList.add('clickable');
		}

	}

	dropItem() {
		this.item = null;
		this.itemIcon.remove();
		delete this.itemIcon;
		this.domElement.classList.remove('clickable');

		if (this.isActive()) {
			this.inventory.deactivateSlot();
		}
		this.deactivate();
	}

	activate() {
		this.background.fill = InventorySlot.backgroundColors.active;
		this.active = true;
	}

	deactivate() {
		if (this.isFilled()) {
			this.background.fill = InventorySlot.backgroundColors.filled;
		} else {
			this.background.fill = InventorySlot.backgroundColors.empty;
		}
		this.active = false;
	}

	isActive() {
		return this.active;
	}

	isFilled() {
		return this.item !== null;
	}
}

InventorySlot.relativeMargin = 0.1;
InventorySlot.relativePadding = 0.1;
InventorySlot.countColors = {
	font: 'white',
	// outline: 'white'
};
InventorySlot.backgroundColors = {
	empty: 'rgba(0, 0, 0, 0.6)',
	filled: 'rgba(64, 64, 64, 0.6)',
	active: 'rgba(255, 255, 255, 0.6)'
};

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

}