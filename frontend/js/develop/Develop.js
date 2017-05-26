"use strict";

const Develop = {

	active: false,
	developPanelAvailable: false,

	isActive: function () {
		return this.active;
	},

	setup: function () {
		this.isActive = true;
		AABBs.setup();

		if (typeof Fps === 'object' && Constants.DEBUGGING.SHOW_FPS) {
			Fps.setup();
		}

		this.setupDevelopPanel();
		this.logs = {
			fps: [],
			serverTickRate: [],
			clientTickRate: []
		}
	},

	setupDevelopPanel: function () {
		makeRequest({
			method: 'GET',
			url: 'developPanel.html'
		}).then(function (html) {
			// TODO append to body
			document.body.appendChild(htmlToElement(html));

			this.developPanelAvailable = true;
		}.bind(this))
	},

	logValue: function (name, value) {
		$('#develop_' + name).text(value);
	},

	logSampledValue: function (name, logArray, value) {
		// Darstellung mit .fixed(1)
		logArray.push(value);
		while (logArray.length > Constants.DEBUGGING.MEASUREMENT_SAMPLE_RATE) {
			logArray.shift();
		}

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
		output += '+';
		output += abweichung.toFixed(0);
		output += ' ms';
		this.logValue(name, output);
	},

	logFPS: function (fps) {
		this.logSampledValue('fps', this.logs.fps, fps);
	},

	logServerTick: function (tick, timeSinceLast) {
		this.logValue('serverTick', tick);
		this.logSampledValue('serverTickRate', this.logs.serverTickRate, timeSinceLast);
	},

	logClientTick: function (tick, timeSinceLast) {
		this.logValue('clientTick', tick);
		this.logSampledValue('clientTickRate', this.logs.clientTickRate, timeSinceLast);
	},
};

if (getUrlParameter('develop')) {
	Develop.setup();
}