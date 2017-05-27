/**
 * Created by XieLong on 21.05.2017.
 */
class InventorySlot {
	constructor(size) {
		this.size = size;
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

	static margin(size) {
		return InventorySlot.relativeMargin * size;
	}

	setItem(item, count) {
		this.count = count || 1;
		this.item = item;
		this.itemIcon =
			new InjectedSVG(
				item.svg,
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

	}

	dropItem() {
		this.item = null;
		this.itemIcon.remove();
		delete this.itemIcon;
		this.background.fill = InventorySlot.backgroundColors.empty;
	}

	activate() {
		this.background.fill = InventorySlot.backgroundColors.active;
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
	constructor() {
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
			this.slots[i] = new InventorySlot(this.height);
			let slotGroup = this.slots[i].group;
			slotGroup.translation.x += i * (margin + this.height);
			this.group.add(slotGroup)
		}

		// TODO DEV
		this.slots[0].setItem(Items.Wood, 54);
		this.slots[1].setItem(Items.BronzeSpear, 3);
		this.slots[1].activate();
	}
}