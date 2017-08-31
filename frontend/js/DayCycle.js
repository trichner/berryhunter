"use strict";

define(['Develop'], function (Develop) {
	const DayCycle = {};

	const ticksPerDay = 7200;
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

	let timeOfDay;

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

	DayCycle.setTimeByTick = function (tick) {
		timeOfDay = (tick % ticksPerDay / ticksPerDay * hoursPerDay + sunriseHour) % hoursPerDay;
		if (Develop.isActive()) {
			Develop.logTimeOfDay(this.getFormattedTime());
		}
	};

	return DayCycle;
});