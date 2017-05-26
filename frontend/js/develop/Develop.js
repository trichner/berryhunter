"use strict";

const Develop = {

	active: false,
	developPanelAvailable: false,

	isActive: function () {
		return this.active;
	},

	setup: function () {
		this.active = true;
		AABBs.setup();
		this.setupDevelopPanel();
		this.logs = {
			fps: [],
			serverTickRate: [],
			clientTickRate: []
		}
	},

	setupDevelopPanel: function () {
		registerPreload(
			makeRequest({
				method: 'GET',
				url: 'developPanel.part.html'
			}).then(function (html) {
				document.body.appendChild(htmlToElement(html));

				this.developPanelAvailable = true;
			}.bind(this)));
	},

	logValue: function (name, value) {
		document.getElementById('develop_' + name).textContent = value;
	},

	logSampledValue: function (name, logArray, value, unit) {
		if (typeof unit === 'undefined') {
			unit = '';
		} else {
			unit = ' ' + unit;
		}
		logArray.push(value);
		while (logArray.length > Constants.DEBUGGING.MEASUREMENT_SAMPLE_RATE) {
			let average = 0;
			logArray.forEach(function (value) {
				average += value;
			});
			average /= logArray.length;

			let abweichung = 0;
			logArray.forEach(function (value) {
				abweichung += Math.abs(value - average);
			});
			abweichung /= logArray.length;

			let output = average.toFixed(1);
			output += '±';
			output += abweichung.toFixed(0);
			output += unit;
			this.logValue(name, output);

			logArray.length = 0;
		}
	},

	logFPS: function (fps) {
		this.logSampledValue('fps', this.logs.fps, fps);
	},

	logServerTick: function (tick, timeSinceLast) {
		this.logValue('serverTick', tick);
		this.logSampledValue('serverTickRate', this.logs.serverTickRate, timeSinceLast, 'ms');
	},

	logClientTick: function (tick) {
		this.logValue('clientTick', tick);
	},

	logClientTickRate: function (timeSinceLast) {
		this.logSampledValue('clientTickRate', this.logs.clientTickRate, timeSinceLast, 'ms');
	},

	logWebsocketStatus: function (text, status) {
		let webSocketCell = document.getElementById('develop_webSocket');
		webSocketCell.textContent = text;
		webSocketCell.classList.remove('neutral');
		webSocketCell.classList.remove('good');
		webSocketCell.classList.remove('bad');

		webSocketCell.classList.add(status);
	}
};

if (getUrlParameter('develop')) {
	Develop.setup();
}