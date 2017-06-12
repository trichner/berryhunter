"use strict";

const Develop = {

	active: false,
	settings: {
		showAABBs: true,
		cameraBoundaries: false,
		elementColor: 'red',
		linewidth: 2,
		/**
		 * Aus wievielen Werten wird maximal der Durchschnitt und die
		 * mittlere absolute Abweichung gebildet
		 */
		measurementSampleRate: 20
	},

	isActive: function () {
		return this.active;
	},

	setup: function () {
		this.active = true;
		AABBs.setup();
		gameObjectClasses.DebugCircle = DebugCircle;
		// Replace with NOOP - DebugCircle doesn't need another AABB
		// DebugCircle.prototype.updateAABB = function () {};

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

				this.setupToggleButtons();

				this.setupItemAdding();
			}.bind(this)));
	},

	setupToggleButtons: function () {
		let buttons = document.querySelectorAll('#developPanel .toggleButton');

		/**
		 *
		 * @param {Node} button
		 * @param {boolean} state
		 */
		function setButtonState(button, state) {

			if (state) {
				button.querySelector('span.state').textContent = 'On';
				button.classList.add('on');
				button.classList.remove('off');
			} else {
				button.querySelector('span.state').textContent = 'Off';
				button.classList.add('off');
				button.classList.remove('on');
			}
		}

		for (let i = 0; i < buttons.length; i++) {
			let button = buttons[i];
			setButtonState(button, Develop.settings[button.getAttribute('data-setting')]);
			button.addEventListener('click', function () {
				let setting = button.getAttribute('data-setting');
				let newValue = !Develop.settings[setting];
				Develop.settings[setting] = newValue;
				setButtonState(button, newValue);
				Develop.onSettingToggle(setting, newValue);
			});
		}
	},

	setupItemAdding: function () {
		let select = document.getElementById('develop_itemSelect');

		let optionGroups = {};
		for (let itemType in ItemType){
			optionGroups[itemType] = htmlToElement('<optgroup label="' + itemType + '"></optgroup>');
			select.appendChild(optionGroups[itemType]);
		}

		for (let item in Items) {
			if (!Items.hasOwnProperty(item)) {
				continue;
			}
			if (!Items[item].icon.file) {
				continue;
			}
			if (Items[item].graphic && !Items[item].graphic.file) {
				continue;
			}

			optionGroups[Items[item].type].appendChild(htmlToElement('<option value="' + item + '">' + item + '</option>'));
		}

		document
			.getElementById('develop_itemAdd')
			.addEventListener('click', function () {
				player.inventory.addItem(
					Items[document.getElementById('develop_itemSelect').value],
					parseInt(document.getElementById('develop_itemCount').value)
				);
				two.update();
			});
	},

	onSettingToggle(setting, newValue){
		switch (setting) {
			case 'showAABBs':
				Object.values(gameMap.objects)
					.forEach(function (gameObject) {
						if (newValue) {
							gameObject.showAABB();
							player.character.showAABB();
						} else {
							gameObject.hideAABB();
							player.character.hideAABB();
						}
					});
				two.update();
		}
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
		while (logArray.length > Develop.settings.measurementSampleRate) {
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

if (getUrlParameter(Constants.MODE_PARAMETERS.DEVELOPMENT)) {
	Develop.setup();
}