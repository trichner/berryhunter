"use strict";

define(['Preloading', 'Game', 'Utils', 'UserInterface', 'InjectedSVG'], function (Preloading, Game, Utils, UserInterface, InjectedSVG) {
	class VitalSigns {
		constructor() {
			this.health = VitalSigns.MAXIMUM_VALUES.health;
			this.satiety = VitalSigns.MAXIMUM_VALUES.satiety;
			this.bodyHeat = VitalSigns.MAXIMUM_VALUES.bodyHeat;

			this.uiBars = {
				health: UserInterface.getVitalSignBar('health'),
				satiety: UserInterface.getVitalSignBar('satiety'),
				bodyHeat: UserInterface.getVitalSignBar('bodyHeat'),
			};

			this.indicators = VitalSigns.indicators;

			this.damageIndicatorDuration = 0;

			Game.renderer.on('prerender', this.update, this);

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
			switch (valueIndex) {
				case 'health':
					// Hand should deal 1% damage. Anything below is damage over time.
					// FIXME: will be later replaced with a system to use hits reported by the backend (that are also used for hit animations)
					if ((this.health - value) > 0.009) {
						this.onDamageTaken();
					}
					break;
			}
			this[valueIndex] = value;
			this.uiBars[valueIndex].setValue(value / VitalSigns.MAXIMUM_VALUES[valueIndex]);
		}

		onDamageTaken() {
			// 300ms shows the damage indicator
			this.damageIndicatorDuration = 0.3;
			// take time since the last frame into consideration as updates are based on frame per frame time
			this.damageIndicatorDuration += Game.timeSinceLastFrame(performance.now());
		}

		update() {
			if (this.damageIndicatorDuration > 0) {
				// Show damage frame

			} else {
				//
			}
		}
	}

	/**
	 * All values are 32bit.
	 *
	 * @type {{health: number, satiety: number, bodyHeat: number}}
	 */
	VitalSigns.MAXIMUM_VALUES = {
		health: 0xffffffff,
		satiety: 0xffffffff,
		bodyHeat: 0xffffffff,
	};

	function createIndicator(svgGraphic) {
		let indicatorSprite = new InjectedSVG(VitalSigns.damageIndicator.svg, 0, 0, indicatorSize / 2);
		indicatorSprite.width = window.innerWidth;
		indicatorSprite.height = window.innerHeight;
		indicatorSprite.visible = false;

		return indicatorSprite;
	}

	VitalSigns.setup = function (group) {
		let indicators = {};
		indicators.damage = createIndicator(VitalSigns.damageIndicator.svg);
		indicators.hunger = createIndicator(VitalSigns.hungerIndicator.svg);
		indicators.coldness = createIndicator(VitalSigns.coldnessIndicator.svg);

		group.addChild(
			indicators.damage,
			indicators.hunger,
			indicators.coldness
		);
		group.position.set(Game.width / 2, Game.height / 2);
	};

	let indicatorSize = Math.max(window.innerWidth, window.innerHeight);
	VitalSigns.damageIndicator = {};
	Preloading.registerGameObjectSVG(VitalSigns.damageIndicator, 'img/overlays/damage.svg', indicatorSize);
	VitalSigns.hungerIndicator = {};
	Preloading.registerGameObjectSVG(VitalSigns.hungerIndicator, 'img/overlays/hunger.svg', indicatorSize);
	VitalSigns.coldnessIndicator = {};
	Preloading.registerGameObjectSVG(VitalSigns.coldnessIndicator, 'img/overlays/coldness.svg', indicatorSize);

	return VitalSigns;
});
