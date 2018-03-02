'use strict';

define(['Utils', 'Develop'], function (Utils, Develop) {
	const DayCycle = {};

	const ticksPerDay = 10 * 60 * 30; // 8 Minutes at 30 tps
	const hoursPerDay = 24;
	/**
	 * First hour that is considered "day" in regards of visuals and temperature
	 * @type {number}
	 */
	const sunriseHour = 6;
	const sunsetHour = sunriseHour + hoursPerDay / 2;
	/**
	 * Time of color fade on dusk / dawn
	 * @type {number}
	 */
	const twilightDuration = 1.5;

	const sunriseStart = sunriseHour - (twilightDuration * 2 / 3);
	const sunriseEnd = sunriseHour + (twilightDuration / 3);

	const sunsetStart = sunsetHour - (twilightDuration / 3);
	const sunsetEnd = sunsetHour + (twilightDuration * 2 / 3);

	const NightVisuals = {
		SATURATION: 0.4,
		FLOOD_COLOR: {
			red: 107,
			green: 131,
			blue: 185
		},
		FLOOD_OPACITY: 0.9,
	};

	let timeOfDay;

	DayCycle.setup = function (mainSvgElement, stage) {
		this.stage = stage;

		this.colorMatrix = new PIXI.filters.ColorMatrixFilter();
		this.filters = [this.colorMatrix];
	};

	DayCycle.getTime = function () {
		return timeOfDay;
	};

	DayCycle.getFormattedTime = function () {
		let hours = Math.floor(timeOfDay);
		let minutes = Math.round(timeOfDay % 1 * 60);

		let result = '';
		if (hours < 10) {
			result += '0';
		}
		result += hours;
		result += ':';

		if (minutes < 10) {
			result += '0';
		}
		result += minutes;

		if (timeOfDay < sunriseStart) {
			result += ' night';
		} else if (timeOfDay < sunriseEnd) {
			result += ' dawn'; // Morgendämmerung
		} else if (timeOfDay < sunsetStart) {
			result += ' day';
		} else if (timeOfDay < sunsetEnd) {
			result += ' dusk'; // Abendämmerung
		} else {
			result += ' night';
		}

		return result;
	};

	let lastOpacity = 0;

	function getNightFilterOpacity() {
		if (timeOfDay < sunriseStart) {
			return 1;
		} else if (timeOfDay < sunriseEnd) {
			return 1 - (timeOfDay - sunriseStart) / twilightDuration;
		} else if (timeOfDay < sunsetStart) {
			return 0;
		} else if (timeOfDay < sunsetEnd) {
			return (timeOfDay - sunsetStart) / twilightDuration;
		} else {
			return 1;
		}
	}

	DayCycle.setTimeByTick = function (tick) {
		timeOfDay = (tick % ticksPerDay / ticksPerDay * hoursPerDay + sunriseHour) % hoursPerDay;
		if (Develop.isActive()) {
			Develop.logTimeOfDay(this.getFormattedTime());
		}

		let opacity = getNightFilterOpacity();
		if (opacity !== lastOpacity) {
			lastOpacity = opacity;

			if (opacity === 0) {
				this.stage.filters = null;
			} else {
				this.stage.filters = this.filters;
				/**
				 * Opacity: Saturation
				 * 0    : 1
				 * 0.5  : 0.65
				 * 1    : 0.3
				 */
				this.colorMatrix.flood(
					NightVisuals.FLOOD_COLOR.red,
					NightVisuals.FLOOD_COLOR.green,
					NightVisuals.FLOOD_COLOR.blue,
					opacity * NightVisuals.FLOOD_OPACITY
				);
				this.colorMatrix.lumaGreyscale(opacity * (1 - NightVisuals.SATURATION), true);
			}
		}
	};

	return DayCycle;
});