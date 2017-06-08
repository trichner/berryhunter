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

		this.clickableIcon = new ClickableIcon(size);

		let fontSize = this.size * 0.25;
		this.countText =
			new Two.Text(0,
				this.size * (0.5 - ClickableIcon.relativePadding) - fontSize / 2,
				this.size * (0.5 - ClickableIcon.relativePadding) - fontSize / 2,
				{
					visible: false,
					fill: ClickableIcon.countColors.font,
					size: fontSize
				});
		this.clickableIcon.add(this.countText);

		this.clickableIcon.onClick = function (event) {
			if (!this.isFilled()) {
				return;
			}
			switch (event.button) {
				// Left Click
				case 0:
					let equipmentSlot = EquipmentHelper.getItemEquipmentSlot(this.item);
					if (this.isActive()) {
						this.deactivate();
						this.inventory.deactivateSlot(equipmentSlot);
					} else {
						this.inventory.activateSlot(this.index, equipmentSlot);
					}
					break;
				case 2:
					// Right Click
					break;
			}
		}.bind(this);
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
		this.clickableIcon.setIconGraphic(item.icon.svg);

		this.setCount(count);

		switch (item.type) {
			case ItemType.EQUIPMENT:
			case ItemType.PLACEABLE:
				this.clickableIcon.setClickable(true);
				break;
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
		this.clickableIcon.removeIconGraphic();
		this.clickableIcon.setClickable(false);

		if (this.isActive()) {
			this.inventory.deactivateSlot(EquipmentHelper.getItemEquipmentSlot(this.item));
		}
		this.item = null;
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


