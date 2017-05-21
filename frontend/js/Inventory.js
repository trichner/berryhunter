/**
 * Created by XieLong on 21.05.2017.
 */
class InventorySlot {
	constructor(size) {
		this.item = null;
		this.count = 0;
		this.active = false;

		this.group = new Two.Group();
		let background = new Two.RoundedRectangle(0, 0, size, size, size * 0.1);
		this.group.add(background);
		background.noStroke();
		background.fill = 'rgba(0, 0, 0, 0.6)';
	}

	static margin(size) {
		return 0.1 * size;
	}
}

class Inventory {
	constructor() {
		this.height = Relative.height(7);

		this.group = new Two.Group();
		groups.overlay.add(this.group);

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
			slotGroup.translation.x +=  i * (margin + this.height);
			this.group.add(slotGroup)
		}
	}
}