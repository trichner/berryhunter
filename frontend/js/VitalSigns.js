"use strict";

define(['Game', 'Two', 'Utils'], function (Game, Two, Utils) {
	class VitalSigns {
		constructor() {
			this.health = VitalSigns.maximumValues.HEALTH;
			this.satiety = VitalSigns.maximumValues.SATIETY;
			this.bodyHeat = VitalSigns.maximumValues.BODYHEAT;

			this.group = new Two.Group();
			Game.groups.overlay.add(this.group);
			this.width = Game.relativeWidth(15);
			this.height = Game.relativeHeight(12);
			this.group.translation.set(
				Game.width - this.width / 2,
				Game.height - this.height / 2
			);
			// let background = new Two.RoundedRectangle(0, 0, this.width, this.height, 5);
			// this.group.add(background);
			// background.fill = ClickableIcon.backgroundColors.empty;

			this.indicators = {};
			this.group.add(this.createBar(0, 'HEALTH'));
			this.group.add(this.createBar(1, 'SATIETY'));
			this.group.add(this.createBar(2, 'BODYHEAT'));

			this.setHealth(Utils.randomInt(VitalSigns.maximumValues.HEALTH * 0.25, VitalSigns.maximumValues.HEALTH));
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


			let indicator = new Two.Rectangle(0, y, this.width, barHeight);
			group.add(indicator);
			this.indicators[colorIndex] = indicator;
			indicator.noStroke();
			indicator.fill = VitalSigns.colors[colorIndex].ACTIVE;

			return group;
		}

		setHealth(health) {
			this.setValue('health', health);
		}

		setSatiety(satiety) {
			this.setValue('satiety', satiety);
		}

		setBodyHeat(bodyHeat) {
			this.setValue('bodyHeat', bodyHeat);
		}

		setValue(valueIndex, value) {
			this[valueIndex] = value;
			valueIndex = valueIndex.toUpperCase();
			this.indicators[valueIndex]._matrix.manual = true;
			let indicator = this.indicators[valueIndex];
			let floatValue = value / VitalSigns.maximumValues[valueIndex];
			indicator.translation.x = this.width * (1 - floatValue) / -2;
			indicator._matrix
				.translate(
					indicator.translation.x,
					indicator.translation.y)
				.scale(floatValue, 1);
		}
	}

	VitalSigns.maximumValues = {
		HEALTH: 1000,
		SATIETY: 1000,
		BODYHEAT: 1000
	};

	VitalSigns.colors = {
		HEALTH: {
			ACTIVE: 'crimson',
			PASSIVE: '#840D25'
		},
		SATIETY: {
			ACTIVE: 'limegreen',
			PASSIVE: '#1E7A1E'
		},
		BODYHEAT: {
			ACTIVE: 'dodgerblue',
			PASSIVE: '#125799'
		}
	};

	return VitalSigns;
});
