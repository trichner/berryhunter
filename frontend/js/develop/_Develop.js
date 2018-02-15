"use strict";

define([
	'Game',
	'develop/AABBs',
	'develop/Fps',
	'Preloading',
	'Utils',
	'MapEditor',
	'Console',
	'items/ItemType',
	'Constants',
	'items/Items',
], function (Game, AABBs, Fps, Preloading, Utils, MapEditor, Console, ItemType, Constants, Items) {

	const Develop = {

		active: false,
		settings: {
			showAABBs: false,
			cameraBoundaries: true,
			elementColor: 0xFF0000,
			linewidth: 2,
			/**
			 * Aus wievielen Werten wird maximal der Durchschnitt und die
			 * mittlere absolute Abweichung gebildet
			 */
			measurementSampleRate: 20,
		},

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
				clientTickRate: [],
			}
		},

		setupDevelopPanel: function () {
			Preloading.registerPartial('partials/developPanel.html')
				.then(function () {
					let developPanel = document.getElementById('developPanel');
					// Capture inputs to prevent game actions while acting in develop panel
					['click', 'pointerup', 'pointerdown', 'mouseup', 'mousedown', 'keyup', 'keydown']
						.forEach(function (eventName) {
							developPanel.addEventListener(eventName, function (event) {
								event.stopPropagation();
							})
						});

					this.setupToggleButtons();

					this.setupItemAdding();

					this.setupTickSampler();

					this.setupChart();
				}.bind(this));
		},

		setupToggleButtons: function () {
			let buttons = document.querySelectorAll('#developPanel .toggleButton');

			/**
			 *
			 * @param {Element} button
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
			for (let itemType in ItemType) {
				optionGroups[itemType] = Utils.htmlToElement('<optgroup label="' + itemType + '"></optgroup>');
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

				optionGroups[Items[item].type].appendChild(Utils.htmlToElement('<option value="' + item + '">' + item + '</option>'));
			}

			let itemAdd = document.getElementById('develop_itemAdd');
			let itemCount = document.getElementById('develop_itemCount');
			itemCount.addEventListener('input', function () {
				itemCount.style.width = Math.max(1.6, (1 + (itemCount.value.length * 0.6))) + 'em';
				let step;
				if (itemCount.value < 10) {
					step = 1;
				} else {
					step = Math.pow(10, itemCount.value.length - 2) * 5;
				}
				itemCount.setAttribute('step', step);
				itemCount.setAttribute('min', step); // otherwise steps will be 11, 16, ...

				itemAdd.classList.toggle('plural', itemCount.value !== '1');
			});
			itemCount.style.width = (1 + (itemCount.value.length * 0.6)) + 'em';


			itemAdd.addEventListener('click', function () {
				let item = document.getElementById('develop_itemSelect').value;
				let count = itemCount.value;
				if (MapEditor.isActive()) {
					Game.player.inventory.addItem(
						Items[item],
						parseInt(count),
					);
				} else {
					Console.run('GIVE ' + item + ' ' + count);
				}
			});
		},

		onSettingToggle(setting, newValue) {
			switch (setting) {
				case 'showAABBs':
					Object.values(Game.map.objects)
						.forEach(function (gameObject) {
							if (newValue) {
								gameObject.showAABB();
								if (Utils.isDefined(Game.player)) {
									Game.player.character.showAABB();
								}
							} else {
								gameObject.hideAABB();
								if (Utils.isDefined(Game.player)) {
									Game.player.character.hideAABB();
								}
							}
						});
					Game.render();
			}
		},

		setupTickSampler() {
			this.showNextGameState = false;
			let showServerTick = document.getElementById('develop_showServerTick');

			if (MapEditor.isActive()) {
				showServerTick.style.display = 'none';
				return;
			}

			showServerTick.addEventListener('click', function () {
				let serverTickPopup = document.getElementById('serverTickPopup');
				serverTickPopup.classList.remove('hidden');
				Develop.showNextGameState = true;
			});

			let closeServerTick = document.getElementById('develop_closeServerTickPopup');
			closeServerTick.addEventListener('click', function () {
				let serverTickPopup = document.getElementById('serverTickPopup');
				serverTickPopup.classList.add('hidden');
			});
		},

		setupChart() {

		},

		afterSetup: function () {
			Fps.setup();

			// Make the Game object available in console
			window.Game = Game;
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
			if (logArray.length > Develop.settings.measurementSampleRate) {
				let average = 0;
				let min = 10000;
				let max = 0;
				logArray.forEach(function (value) {
					average += value;
					if (value > max) {
						max = value;
					}
					if (value < min) {
						min = value;
					}
				});
				average /= logArray.length;

				let abweichung = 0;
				logArray.forEach(function (value) {
					abweichung += Math.abs(value - average);
				});
				abweichung /= logArray.length;

				let output = min.toFixed(0);
				output += '/';
				output += average.toFixed(0);
				output += '/';
				output += max.toFixed(0);
				// output += '±';
				// output += abweichung.toFixed(0);
				output += unit;
				this.logValue(name, output);

				logArray.length = 0;
			}
		},

		logFPS: function (fps) {
			this.logSampledValue('fps', this.logs.fps, fps);
		},

		logServerMessage: function (message, messageType, timeSinceLast) {
			console.info('Received ' + messageType + ' message.');

			this.logSampledValue('serverTickRate', this.logs.serverTickRate, timeSinceLast, 'ms');
			if (this.showNextGameState) {
				document.getElementById('serverTickOutput').textContent = JSON.stringify(message, null, 2);
				this.showNextGameState = false;
			}
		},

		logServerTick: function (gameState, timeSinceLast) {
			this.logValue('serverTick', gameState.tick);
			this.logSampledValue('serverTickRate', this.logs.serverTickRate, timeSinceLast, 'ms');
			if (this.showNextGameState) {
				document.getElementById('serverTickOutput').textContent = JSON.stringify(gameState, this.serverTickReplacer, 2);
				this.showNextGameState = false;
			}
		},

		logTimeOfDay: function (formattedTimeOfDay) {
			document.getElementById('develop_timeOfDay').textContent = formattedTimeOfDay;
		},

		serverTickReplacer: function (key, value) {
			switch (key) {
				case 'item':
				case 'type':
					return value.name;
				case 'equipment':
					return value.map(entry => {
						return entry.name;
					});
				case 'x':
				case 'y':
				case 'LowerX':
				case 'LowerY':
				case 'UpperX':
				case 'UpperY':
					return Math.round(value * 100) / 100;
				case 'rotation':
					return Utils.rad2deg(value) + 'deg';
			}

			return value;
		},

		logClientTick: function (inputObj) {
			this.logValue('clientTick', inputObj.tick);

			let movementStr = '';
			if (Utils.isDefined(inputObj.movement)) {
				switch (inputObj.movement.x) {
					case 1:
						switch (inputObj.movement.y) {
							case 1:
								movementStr = '\u2198️'; // ↘
								break;
							case 0:
								movementStr = '\u27A1'; // ➡
								break;
							case -1:
								movementStr = '\u2197'; // ↗
								break;
						}
						break;
					case 0:
						switch (inputObj.movement.y) {
							case 1:
								movementStr = '\u2b07'; // ⬇
								break;
							case 0:
								// movementStr = '\u26d4'; // ---
								break;
							case -1:
								movementStr = '\u2b06'; // ⬆
								break;
						}
						break;
					case -1:
						switch (inputObj.movement.y) {
							case 1:
								movementStr = '\u2199'; // ↙
								break;
							case 0:
								movementStr = '\u2b05'; // ⬅
								break;
							case -1:
								movementStr = '\u2196'; // ↖
								break;
						}
						break;
				}
			} else {
				// movementStr = '\u26d4'; // ---
			}

			document.getElementById('develop_input_movement').textContent = movementStr;

			if (Utils.isDefined(inputObj.rotation)) {
				document.getElementById('develop_input_rotation').textContent = (inputObj.rotation * (180 / Math.PI)).toFixed(0);
			} else {
				document.getElementById('develop_input_rotation').textContent = '';
			}

			if (Utils.isDefined(inputObj.action)) {
				if (inputObj.action.item === null) {
					document.getElementById('develop_input_action_item').textContent = 'None';
				} else {
					document.getElementById('develop_input_action_item').textContent = inputObj.action.item.name;
				}
				let actionType;
				let actionTypeId = ' [' + inputObj.action.actionType + ']';
				switch (inputObj.action.actionType) {
					case BerryhunterApi.ActionType.Primary:
						actionType = 'Primary' + actionTypeId + ' with';
						break;
					case BerryhunterApi.ActionType.CraftItem:
						actionType = 'Craft' + actionTypeId;
						break;
					case BerryhunterApi.ActionType.EquipItem:
						actionType = 'Equip' + actionTypeId;
						break;
					case BerryhunterApi.ActionType.UnequipItem:
						actionType = 'Unequip' + actionTypeId;
						break;
					case BerryhunterApi.ActionType.DropItem:
						actionType = 'Drop' + actionTypeId;
						break;
					case BerryhunterApi.ActionType.PlaceItem:
						actionType = 'Place' + actionTypeId;
						break;
					case BerryhunterApi.ActionType.ConsumeItem:
						actionType = 'Consume' + actionTypeId;
						break;
					default:
						actionType = 'Unmapped' + actionTypeId;
						break;
				}
				document.getElementById('develop_input_action_type').textContent = actionType;
			} else {
				document.getElementById('develop_input_action_item').textContent = '';
				document.getElementById('develop_input_action_type').textContent = '';
			}
		},

		logClientTickRate: function (timeSinceLast) {
			this.logSampledValue('clientTickRate', this.logs.clientTickRate, timeSinceLast, 'ms');
		},

		logWebsocketStatus: function (text, status) {
			let webSocketCell = document.getElementById('develop_webSocket');
			// FIXME why? All DOM should be loaded if this code is run
			if (webSocketCell === null) {
				return;
			}
			webSocketCell.textContent = text;
			webSocketCell.classList.remove('neutral');
			webSocketCell.classList.remove('good');
			webSocketCell.classList.remove('bad');

			webSocketCell.classList.add(status);
		},
	};

	if (Utils.getUrlParameter(Constants.MODE_PARAMETERS.DEVELOPMENT)) {
		Develop.setup();
	}

	return Develop;
});