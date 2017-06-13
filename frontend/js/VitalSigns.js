"use strict";

class VitalSigns {
	constructor() {
		this.health = 1000;
		this.satiety = 1000;
		this.bodyHeat = 1000;

		this.group = new Two.Group();
		groups.overlay.add(this.group);
		this.width = Relative.width(15);
		this.height = Relative.height(12);
		this.group.translation.set(
			width - this.width / 2,
			height - this.height / 2
		);
		// let background = new Two.RoundedRectangle(0, 0, this.width, this.height, 5);
		// this.group.add(background);
		// background.fill = ClickableIcon.backgroundColors.empty;

		this.indicators = {};
		this.group.add(this.createBar(0, 'HEALTH'));
		this.group.add(this.createBar(2, 'SATIETY'));
		this.group.add(this.createBar(1, 'BODY_HEAT'));
	}

	/**
	 * Alle balken zusammen nehmen 2/3 der Höhe ein - der Rest sind Abstände
	 * demnach ist ein Balken 2/9 der gesamthöhe, abstände sind 2/15
	 *
	 * @param posIndex
	 * @param colorIndex
	 */
	createBar(posIndex, colorIndex) {
		let group = new Two.Group();

		let margin = this.height * 2 / 15;
		let barHeight = this.height * 2 / 9;
		let y = this.height / -2 + margin + (barHeight + margin) * posIndex;
		let background = new Two.Rectangle(0, y, this.width, barHeight);
		group.add(background);
		background.noStroke();
		background.fill = VitalSigns.colors[colorIndex].PASSIVE;

		let value = random(0, 1);

		let indicator = new Two.Rectangle(this.width * (1 - value) / -2, y, this.width * value, barHeight);
		group.add(indicator);
		this.indicators[colorIndex] = indicator;
		indicator.noStroke();
		indicator.fill = VitalSigns.colors[colorIndex].ACTIVE;

		return group;
	}
}

VitalSigns.colors = {
	HEALTH: {
		ACTIVE: 'crimson',
		PASSIVE: '#840D25'
	},
	SATIETY: {
		ACTIVE: 'limegreen',
		PASSIVE: '#1E7A1E'
	},
	BODY_HEAT: {
		ACTIVE: 'dodgerblue',
		PASSIVE: '#125799'
	}
};