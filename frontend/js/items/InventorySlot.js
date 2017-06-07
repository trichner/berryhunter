"use strict";
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

		this.iconGroup = new Two.Group();
		this.group.add(this.iconGroup);

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
			if (!this.isFilled()) {
				return;
			}
			switch (event.button) {
				// Left Click
				case 0:
					let equipementSlot = EquipmentHelper.getItemEquipmentSlot(this.item);
					if (this.isActive()) {
						this.deactivate();
						this.inventory.deactivateSlot(equipementSlot);
					} else {
						this.inventory.activateSlot(this.index, equipementSlot);
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
		count = count || 1;
		this.item = item;
		this.itemIcon =
			new InjectedSVG(
				item.icon.svg,
				0, 0,
				this.size * (0.5 - InventorySlot.relativePadding));
		this.iconGroup.add(this.itemIcon);
		this.background.fill = InventorySlot.backgroundColors.filled;


		this.setCount(count);

		if (item.type === ItemType.EQUIPMENT) {
			this.domElement.classList.add('clickable');
		}
	}

	setCount(count) {
		this.count = count;
		if (this.count === 1) {
			this.countText.visible = false;
		} else {
			this.countText.visible = true;
			this.countText.value = this.count;
		}
	}

	addCount(count) {
		this.setCount(this.count + count);
	}

	dropItem() {
		this.itemIcon.remove();
		delete this.itemIcon;
		this.domElement.classList.remove('clickable');

		if (this.isActive()) {
			this.inventory.deactivateSlot(EquipmentHelper.getItemEquipmentSlot(this.item));
		}
		this.item = null;
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
