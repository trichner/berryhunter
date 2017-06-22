"use strict";

define(['Game', 'develop/AABBs', 'develop/Fps', 'Preloading', 'Utils', 'MapEditor', 'items/ItemType', 'Constants'],
	function (Game, AABBs, Fps, Preloading, Utils, MapEditor, ItemType, Constants) {

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

				this.setupDevelopPanel();
				this.logs = {
					fps: [],
					serverTickRate: [],
					clientTickRate: []
				}
			},

			setupDevelopPanel: function () {
				Preloading.registerPartial('partials/developPanel.html')
					.then(function () {
						console.log('DevelopPanel DOM loaded');

						this.setupToggleButtons();

						this.setupItemAdding();

						this.setupTickSampler();
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

				document
					.getElementById('develop_itemAdd')
					.addEventListener('click', function () {
						Game.player.inventory.addItem(
							Items[document.getElementById('develop_itemSelect').value],
							parseInt(document.getElementById('develop_itemCount').value)
						);
						Game.two.update();
					});
			},

			onSettingToggle(setting, newValue){
				switch (setting) {
					case 'showAABBs':
						Object.values(Game.map.objects)
							.forEach(function (gameObject) {
								if (newValue) {
									gameObject.showAABB();
									Game.player.character.showAABB();
								} else {
									gameObject.hideAABB();
									Game.player.character.hideAABB();
								}
							});
						Game.two.update();
				}
			},

			setupTickSampler(){
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

			onTwoAvailable: function(two){
				Fps.setup(two);
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

			logServerTick: function (gameState, timeSinceLast) {
				this.logValue('serverTick', gameState.tick);
				this.logSampledValue('serverTickRate', this.logs.serverTickRate, timeSinceLast, 'ms');
				if (this.showNextGameState) {
					document.getElementById('serverTickOutput').textContent = JSON.stringify(gameState, null, 2);
					this.showNextGameState = false;
				}
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
					document.getElementById('develop_input_action').textContent = inputObj.action.item;
				} else {
					document.getElementById('develop_input_action').textContent = '';
				}
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

		if (Utils.getUrlParameter(Constants.MODE_PARAMETERS.DEVELOPMENT)) {
			Develop.setup();
		}

		return Develop;
	});