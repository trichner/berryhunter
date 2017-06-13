"use strict";

class VitalSigns {
	constructor() {
		this.health = 1000;
		this.bodyHeat = 1000;
		this.satiety = 1000;

		this.group = new Two.Group();
		groups.overlay.add(this.group);
		this.group.translation.set(
			width - Relative.width(15) / 2,
			height - Relative.height(12) / 2
		);
		let background = new Two.RoundedRectangle(0, 0, Relative.width(15), Relative.height(12), 5);
		this.group.add(background);
		background.fill = ClickableIcon.backgroundColors.empty;
	}
}