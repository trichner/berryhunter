"use strict";

define(['Game', 'Two', 'Utils', 'UserInterface', 'EndScreen'], function (Game, Two, Utils, UserInterface, EndScreen) {
	class VitalSigns {
		constructor() {
			this.health = VitalSigns.MAXIMUM_VALUES.health;
			this.satiety = VitalSigns.MAXIMUM_VALUES.satiety;
			this.bodyHeat = VitalSigns.MAXIMUM_VALUES.bodyHeat;

			this.indicators = {
				health: UserInterface.getVitalSignBar('health'),
				satiety: UserInterface.getVitalSignBar('satiety'),
				bodyHeat: UserInterface.getVitalSignBar('bodyHeat')
			};

			this.setHealth(Utils.randomInt(VitalSigns.MAXIMUM_VALUES.health * 0.25, VitalSigns.MAXIMUM_VALUES.health));
			this.setSatiety(Utils.randomInt(VitalSigns.MAXIMUM_VALUES.satiety * 0.25, VitalSigns.MAXIMUM_VALUES.satiety));
			this.setBodyHeat(Utils.randomInt(VitalSigns.MAXIMUM_VALUES.bodyHeat * 0.25, VitalSigns.MAXIMUM_VALUES.bodyHeat));
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
			this.indicators[valueIndex].setValue(value / VitalSigns.MAXIMUM_VALUES[valueIndex]);

			if (valueIndex === 'health' && value <= 0){
				// Player is dead
				EndScreen.show();
			}
		}
	}

	VitalSigns.MAXIMUM_VALUES = {
		health: 255,
		satiety: 255,
		bodyHeat: 255
	};

	return VitalSigns;
});
