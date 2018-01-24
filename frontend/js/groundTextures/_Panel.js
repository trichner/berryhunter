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

	let active = false;

	const GroundTexturePanel = {};

	GroundTexturePanel.isActive = function () {
		return active;
	};

	GroundTexturePanel.setup = function () {
		active = true;

		setupPanel();
		this.logs = {
			fps: [],
			serverTickRate: [],
			clientTickRate: [],
		}
	};

	function setupPanel() {
		Preloading.registerPartial('partials/developPanel.html')
			.then(function () {
				setupToggleButtons();

				setupItemAdding();

				setupTickSampler();

				setupChart();
			}.bind(this));
	}

	function setupToggleButtons() {
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
	}

	function setupItemAdding() {
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
				let item = document.getElementById('develop_itemSelect').value;
				let count = document.getElementById('develop_itemCount').value;
				if (MapEditor.isActive()) {
					Game.player.inventory.addItem(
						Items[item],
						parseInt(count),
					);
				} else {
					Console.run('GIVE ' + item + ' ' + count);
				}
			});
	}


	GroundTexturePanel.afterSetup = function () {
	};


	if (Utils.getUrlParameter(Constants.MODE_PARAMETERS.GROUND_TEXTURE_EDITOR)) {
		GroundTexturePanel.setup();
	}

	return GroundTexturePanel;
});