'use strict';

define(['Preloading', 'Game', 'Utils', 'userInterface/UserInterface', 'InjectedSVG', 'GraphicsConfig'], function (Preloading, Game, Utils, UserInterface, InjectedSVG, GraphicsConfig) {
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

			// hide all indicators
			Object.values(this.indicators).forEach(function (indicator) {
				indicator.visible = false;
			});

			this.damageIndicatorDuration = 0;

			Game.renderer.on('prerender', this.update, this);
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
					if ((this.health - value) > (0.009 * VitalSigns.MAXIMUM_VALUES.health)) {
						this.onDamageTaken();
					}
					break;
			}
			this[valueIndex] = value;
			this.uiBars[valueIndex].setValue(value / VitalSigns.MAXIMUM_VALUES[valueIndex]);
		}

		onDamageTaken() {
			// 300ms shows the damage indicator
			this.damageIndicatorDuration = 500;
			this.showIndicator('damage', 0);
		}

		update() {
			if (this.damageIndicatorDuration > 0) {
				// Show damage frame
				this.damageIndicatorDuration -= Game.timeDelta;
				if (this.damageIndicatorDuration < 0) {
					this.hideIndicator('damage');
				} else {
					this.showIndicator('damage', getDamageOpacity(this.damageIndicatorDuration));
				}
			} else {
				let relativeSatiety = this.satiety / VitalSigns.MAXIMUM_VALUES.satiety;
				let relativeBodyHeat = this.bodyHeat / VitalSigns.MAXIMUM_VALUES.bodyHeat;
				let lowestVitalSign, indicatorToShow;

				if (relativeSatiety < relativeBodyHeat) {
					indicatorToShow = 'hunger';
					lowestVitalSign = relativeSatiety;
				} else {
					indicatorToShow = 'coldness';
					lowestVitalSign = relativeBodyHeat;
				}

				if (lowestVitalSign < GraphicsConfig.vitalSigns.overlayThreshold) {
					let opacity = 1 - (lowestVitalSign / GraphicsConfig.vitalSigns.overlayThreshold);
					this.showIndicator(indicatorToShow, opacity);
				} else {
					this.hideIndicator('hunger');
					this.hideIndicator('coldness');
				}
			}
		}

		showIndicator(indicatorName, opacity) {
			if (this.currentIndicator !== indicatorName) {
				this.currentIndicator = indicatorName;
				Object.values(this.indicators).forEach(function (indicator) {
					indicator.visible = false;
				});
				this.indicators[indicatorName].visible = true;
			}

			this.indicators[indicatorName].alpha = opacity;
		}

		hideIndicator(indicatorName) {
			if (this.currentIndicator !== indicatorName) {
				return;
			}

			this.currentIndicator = undefined;
			this.indicators[indicatorName].visible = false;
		}

		destroy(){
			Game.renderer.off('prerender', this.update, this);
		}
	}

	/**
	 * 500 - 420ms --> fadeIn
	 * 420 - 280ms --> show
	 * 280 -   0ms --> fadeOut
	 * @param time
	 */
	function getDamageOpacity(time) {
		if (time > 420) {
			return Utils.map(time, 500, 420, 0, 1);
		} else if (time >= 280) {
			return 1;
		} else {
			return Utils.map(time, 280, 0, 1, 0);
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
		let indicatorSprite = new InjectedSVG(svgGraphic, 0, 0, indicatorSize / 2);
		indicatorSprite.width = window.innerWidth;
		indicatorSprite.height = window.innerHeight;
		indicatorSprite.visible = false;

		return indicatorSprite;
	}

	VitalSigns.setup = function (group) {
		let indicators = {};
		indicators.damage = createIndicator(VitalSigns.damageIndicator.svg);
		// indicators.damage.visible = true;
		indicators.hunger = createIndicator(VitalSigns.hungerIndicator.svg);
		indicators.coldness = createIndicator(VitalSigns.coldnessIndicator.svg);
		VitalSigns.indicators = indicators;

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
