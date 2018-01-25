"use strict";

define([
	'Game',
	'Preloading',
	'Utils',
	'Constants',
	'./GroundTextureTypes'
], function (Game, Preloading, Utils, Constants, GroundTextureTypes) {

	let active = false;

	const GroundTexturePanel = {};

	GroundTexturePanel.isActive = function () {
		return active;
	};

	GroundTexturePanel.setup = function () {
		Game.renderer.on('prerender', function () {
			if (Game.state === Game.States.PLAYING) {
				let position = Game.player.character.getPosition();
				this.xLabel.textContent = position.x.toFixed(0);
				this.yLabel.textContent = position.y.toFixed(0);
			}
		}, this);
	};

	function setupPanel() {
		this.xLabel = document.getElementById('groundTexture_x');
		this.yLabel = document.getElementById('groundTexture_y');
		this.minSizeLabel = document.getElementById('groundTexture_minSize');
		this.maxSizeLabel = document.getElementById('groundTexture_maxSize');
		this.sizeInput = document.getElementById('groundTexture_size');
		this.rotationInput = document.getElementById('groundTexture_rotation');
		this.flippedRadios = document.getElementsByName('groundTexture_flipped');

		let typeSelect = document.getElementById('groundTexture_type');
		let types = Object.keys(GroundTextureTypes);
		Utils.sortStrings(types);
		types.map(function (type) {
			return Utils.htmlToElement('<option value="' + type + '">' + type + '</option>');
		}).forEach(function (option) {
			typeSelect.appendChild(option);
		});
		typeSelect.addEventListener('change', function () {
			let groundTextureType = GroundTextureTypes[typeSelect.value];
			this.minSizeLabel.textContent = groundTextureType.minSize;
			this.maxSizeLabel.textContent = groundTextureType.maxSize;
			this.sizeInput.value = Utils.roundToNearest(
				Utils.randomInt(groundTextureType.minSize, groundTextureType.maxSize),
				5);
			this.rotationInput.value = Utils.randomInt(0, 359);
			this.flippedRadios.item(Utils.randomInt(0, 2)).checked = true;
		}.bind(this));

		// TODO on change listener für inputs
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
		active = true;

		Preloading.registerPartial('partials/groundTexturePanel.html')
			.then(setupPanel.bind(GroundTexturePanel));
	}

	return GroundTexturePanel;
});