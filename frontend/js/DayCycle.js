"use strict";

define(['Utils', 'Develop'], function (Utils, Develop) {
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

	const NightVisuals = {
		SATURATION: 0.2,
		FLOOD_COLOR: 'rgb(107,131,185)',
		FLOOD_OPACITY: 1,
	};

	let timeOfDay;

	DayCycle.setup = function (mainSvgElement, scene) {
		this.scene = scene;

		let defContainer = document.createDocumentFragment();

		let nightFilter = Utils.svgToElement(
			'<filter x="0" y="0" width="1" height="1" ' +
			'color-interpolation-filters="sRGB" id="nightFilter"></filter>');
		defContainer.appendChild(nightFilter);

		this.feColorMatrix = Utils.svgToElement('<feColorMatrix ' +
			'id="feColorMatrix3996" ' +
			'result="result1" ' +
			'values="' + NightVisuals.SATURATION + '" ' +
			'type="saturate" />');
		nightFilter.appendChild(this.feColorMatrix);

		this.feFlood = Utils.svgToElement('<feFlood ' +
			'flood-opacity="' + NightVisuals.FLOOD_OPACITY + '" ' +
			'id="feFlood3998" ' +
			'flood-color="' + NightVisuals.FLOOD_COLOR + '" />');
		nightFilter.appendChild(this.feFlood);

		nightFilter.appendChild(Utils.svgToElement('<feBlend ' +
			'in2="result1" ' +
			'mode="multiply" ' +
			'result="result2" ' +
			'id="feBlend4000" />'));
		nightFilter.appendChild(Utils.svgToElement('<feComposite ' +
			'in2="SourceGraphic" ' +
			'operator="in" ' +
			'in="result2" ' +
			'result="result3" ' +
			'id="feComposite4002" />'));

		mainSvgElement.getElementsByTagName('defs')[0].appendChild(defContainer);
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

		if (Utils.isUndefined(this.scene._renderer) ||
			Utils.isUndefined(this.scene._renderer.elem)) {
			return;
		}

		let opacity = getNightFilterOpacity();
		if (opacity !== lastOpacity) {
			lastOpacity = opacity;

			if (opacity === 0) {
				this.scene._renderer.elem.removeAttribute('filter');
			} else {
				// if (lastOpacity === 0) {
				this.scene._renderer.elem.setAttribute('filter', 'url(#nightFilter)');
				// }
				/**
				 * Opacity: Saturation
				 * 0    : 1
				 * 0.5  : 0.65
				 * 1    : 0.3
				 */
				this.feColorMatrix.setAttribute('values', 1 - opacity + opacity * NightVisuals.SATURATION);
				this.feFlood.setAttribute('flood-opacity', opacity * NightVisuals.FLOOD_OPACITY);
			}
		}
	};

	return DayCycle;
});