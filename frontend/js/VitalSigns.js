"use strict";

class VitalSigns {
	constructor() {
		this.health = 1000;
		this.bodyHeat = 1000;
		this.satiety = 1000;

		this.group = new Two.Group();
		this.group.translation.set(
			height - Relative.width(7.5),
			width - Relative.width(15)
		);
		let background = new Two.RoundedRectangle(0, 0, Relative.width(7.5), Relative.width(15), 5);
		this.group.add(background);
		background.fill = ClickableIcon.backgroundColors.empty;
	}
}