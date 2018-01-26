"use strict";

define([
	'Game',
	'Preloading',
	'Utils',
	'Constants',
	'./GroundTextureTypes',
	'./GroundTextureManager'
], function (Game, Preloading, Utils, Constants, GroundTextureTypes, GroundTextureManager) {

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
		this.controlsContainer = document.getElementById('groundTexture_controls');
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
			this.groundTextureType = GroundTextureTypes[typeSelect.value];

			randomizeInputs.call(this);

			this.controlsContainer.classList.remove('hidden');
		}.bind(this));

		this.rotationInput.addEventListener('input', function () {
			let value = parseInt(this.value);
			if (value < 0) {
				this.value = 360 + (value % 360)
			} else if (value >= 360) {
				this.value = value % 360;
			}
		});

		document.getElementById('groundTexture_placeButton').addEventListener('click', function (event) {
			event.preventDefault();

			if (Game.state !== Game.States.PLAYING) {
				return;
			}

			let position = Game.player.character.getPosition();
			GroundTextureManager.placeTexture({
				x: position.x,
				y: position.y,
				size: parseInt(this.sizeInput.value),
				rotation: Utils.deg2rad(this.rotationInput.value)
			});

			if (Utils.isDefined(this.groundTextureType)) {
				randomizeInputs.call(this);
			}
		}.bind(this));

		// TODO bind show popup link
		// TODO Populate popup with all placed textures
	}

	function randomizeInputs() {
		let groundTextureType = this.groundTextureType;

		this.minSizeLabel.textContent = groundTextureType.minSize;
		this.maxSizeLabel.textContent = groundTextureType.maxSize;
		this.sizeInput.value = Utils.roundToNearest(
			Utils.randomInt(groundTextureType.minSize, groundTextureType.maxSize + 1),
			5);
		this.sizeInput.setAttribute('min', groundTextureType.minSize);
		this.sizeInput.setAttribute('max', groundTextureType.maxSize);
		this.rotationInput.value = Utils.randomInt(0, 360);
		this.flippedRadios.item(Utils.randomInt(0, 3)).checked = true;
	}

	if (Utils.getUrlParameter(Constants.MODE_PARAMETERS.GROUND_TEXTURE_EDITOR)) {
		active = true;

		Preloading.registerPartial('partials/groundTexturePanel.html')
			.then(setupPanel.bind(GroundTexturePanel));
	}

	return GroundTexturePanel;
});