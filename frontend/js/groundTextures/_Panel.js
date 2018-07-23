'use strict';

define([
	'Game',
	'Events',
	'items/Items',
	'items/Equipment',
	'Preloading',
	'Utils',
	'Constants',
	'./GroundTextureTypes',
	'./GroundTextureManager',
	'saveAs'
], function (Game, Events, Items, Equipment, Preloading, Utils, Constants, GroundTextureTypes, GroundTextureManager, saveAs) {

	let active = false;

	const GroundTexturePanel = {};

	GroundTexturePanel.isActive = function () {
		return active;
	};

	GroundTexturePanel.setup = function () {
		if (!active) {
			return;
		}
		if (Utils.getUrlParameter('token')) {
			require(['Console'], function (Console) {
				Console.log('GroundTexturePanel activated - try to activate GODMODE now.');
				Console.run('GOD');
			});
		} else {
			alert('WARNING: Missing token, can not activate god mode.')
		}

		Game.renderer.on('prerender', function () {
			if (Game.state === Game.States.PLAYING) {
				let position = Game.player.character.getPosition();
				this.currentXLabel.textContent = position.x.toFixed(0);
				this.currentYLabel.textContent = position.y.toFixed(0);

				let x = Game.player.camera.getMapX(Game.input.activePointer.x);
				let y = Game.player.camera.getMapY(Game.input.activePointer.y);
				this.xLabel.textContent = x.toFixed(0);
				this.yLabel.textContent = y.toFixed(0);
			}
		}, this);

		Game.domElement.addEventListener('click', function (event) {
			if (Game.player.character.getEquippedItem(Equipment.Slots.HAND) === Items.MysticWand) {
				let x = Game.player.camera.getMapX(event.pageX);
				let y = Game.player.camera.getMapY(event.pageY);
				GroundTexturePanel.placeTexture.call(GroundTexturePanel, {x, y});
			}
		});
	};

	Events.on('game.playing', function () {
		if (Utils.getUrlParameter('token')) {
			require(['Console'], function (Console) {
				Console.log('GroundTexturePanel activated - try to grant MysticWand');
				Console.run('give MysticWand');
			});
		}
	});

	function stopPropagation(event) {
		event.stopPropagation();
		// event.preventDefault();
	}

	function setupPanel() {
		let groundTexturePanel = document.getElementById('groundTexturePanel');
		let groundTexturePopup = document.getElementById('groundTexturePopup');
		// Capture inputs to prevent game actions while acting in develop panel
		['pointerdown', 'mousedown', 'keyup', 'keydown']
			.forEach(function (eventName) {
				groundTexturePanel.addEventListener(eventName, stopPropagation);
				groundTexturePopup.addEventListener(eventName, stopPropagation);
			});

		this.typeSelect = document.getElementById('groundTexture_type');
		this.xLabel = document.getElementById('groundTexture_x');
		this.yLabel = document.getElementById('groundTexture_y');
		this.currentXLabel = document.getElementById('groundTexture_currentX');
		this.currentYLabel = document.getElementById('groundTexture_currentY');
		this.controlsContainer = document.getElementById('groundTexture_controls');
		this.minSizeLabel = document.getElementById('groundTexture_minSize');
		this.maxSizeLabel = document.getElementById('groundTexture_maxSize');
		this.sizeInput = document.getElementById('groundTexture_size');
		this.rotationInput = document.getElementById('groundTexture_rotation');
		this.flippedRadios = document.getElementsByName('groundTexture_flipped');
		this.randomizePropertiesToggle = document.getElementById('groundTexture_randomizeProperties');
		this.stackingRadios = document.getElementsByName('groundTexture_stacking');
		this.textureCount = document.getElementById('groundTexture_textureCount');
		this.textureCount.textContent = GroundTextureManager.getTextureCount();
		this.randomizeNextToggle = document.getElementById('groundTexture_randomizeNext');
		this.placeButton = document.getElementById('groundTexture_placeButton');
		this.undoButton = document.getElementById('groundTexture_undoButton');

		let typeSelect = this.typeSelect;
		let types = Object.keys(GroundTextureTypes);
		this.types = types;
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

		// Properties are by default randomized
		this.randomizePropertiesToggle.checked = true;

		this.placeButton.addEventListener('click', function (event) {
			event.preventDefault();

			this.placeTexture(Game.player.character.getPosition());
		}.bind(this));

		this.undoButton.addEventListener('click', function (event) {
			event.preventDefault();

			GroundTextureManager.removeLatestTexture();
			this.textureCount.textContent = GroundTextureManager.getTextureCount();

			this.undoButton.classList.add('hidden');
		}.bind(this));

		let popup = document.getElementById('groundTexturePopup');
		let output = document.getElementById('groundTextureOutput');
		document.getElementById('groundTexture_showPopup').addEventListener('click', function (event) {
			event.preventDefault();

			popup.classList.remove('hidden');

			output.textContent = GroundTextureManager.getTexturesAsJSON();
		});

		document.getElementById('groundTexture_closePopup').addEventListener('click', function (event) {
			event.preventDefault();

			popup.classList.add('hidden');
		});

		document.getElementById('groundTexture_download').addEventListener('click', function (event) {
			event.preventDefault();

			let blob = new Blob([GroundTextureManager.getTexturesAsJSON()], {type: 'application/json;charset=utf-8'});
			saveAs(blob, 'groundTextures.json');
		});
	}

	GroundTexturePanel.placeTexture = function (position) {
		if (Utils.isUndefined(this.groundTextureType)) {
			Game.player.character.say('No ground texture type selected');
			return;
		}

		if (Game.state !== Game.States.PLAYING) {
			console.warn('Ground textures can only be placed while being ingame.');
			return;
		}

		let flipped = 'none';
		this.flippedRadios.forEach(function (element) {
			if (element.checked) {
				flipped = element.value;
			}
		});

		let stacking = 'top';
		this.stackingRadios.forEach(function (radio) {
			if (radio.checked){
				stacking = radio.value;
			}
		});

		GroundTextureManager.placeTexture({
			type: this.groundTextureType,
			x: Math.round(position.x),
			y: Math.round(position.y),
			size: parseInt(this.sizeInput.value),
			rotation: Utils.deg2rad(this.rotationInput.value),
			flipped,
			stacking
		});

		this.textureCount.textContent = GroundTextureManager.getTextureCount();

		randomizeInputs.call(this);

		this.undoButton.classList.remove('hidden');
	};

	function randomizeInputs() {
		let groundTextureType;
		if (this.randomizeNextToggle.checked) {
			let type = Utils.random(this.types);
			this.typeSelect.value = type;
			this.groundTextureType = GroundTextureTypes[type];
		}

		groundTextureType = this.groundTextureType;

		this.minSizeLabel.textContent = groundTextureType.minSize;
		this.maxSizeLabel.textContent = groundTextureType.maxSize;
		this.sizeInput.setAttribute('min', groundTextureType.minSize);
		this.sizeInput.setAttribute('max', groundTextureType.maxSize);
		if (this.randomizePropertiesToggle.checked) {
			this.sizeInput.value = Utils.roundToNearest(
				Utils.randomInt(groundTextureType.minSize, groundTextureType.maxSize + 1),
				5);
		} else {
			if (this.sizeInput.value > groundTextureType.maxSize) {
				this.sizeInput.value = groundTextureType.maxSize;
			} else if (this.sizeInput.value < groundTextureType.minSize) {
				this.sizeInput.value = groundTextureType.minSize;
			}
		}

		if (groundTextureType.hasOwnProperty('rotation')) {
			this.rotationInput.value = groundTextureType.rotation || 0;
		} else if (this.randomizePropertiesToggle.checked) {
			this.rotationInput.value = Utils.randomInt(0, 360);
		}

		if (groundTextureType.hasOwnProperty('flipVertical') && !groundTextureType.flipVertical) {
			if (groundTextureType.hasOwnProperty('flipHorizontal') && !groundTextureType.flipHorizontal) {
				this.flippedRadios.item(0).checked = true;
			} else {
				if (this.randomizePropertiesToggle.checked) {
					this.flippedRadios.item(Utils.randomInt(0, 2)).checked = true;
				} else if (this.flippedRadios.item(2).checked) {
					// If the vertical flip is active right now, switch to no flipping
					this.flippedRadios.item(0).checked = true;
				}
			}
		} else if (groundTextureType.hasOwnProperty('flipHorizontal') && !groundTextureType.flipHorizontal) {
			if (this.randomizePropertiesToggle.checked) {

				let random = Utils.randomInt(0, 2);
				if (random === 1) {
					random = 2;
				}
				this.flippedRadios.item(random).checked = true;
			} else if (this.flippedRadios.item(1).checked) {
				// If the horizontal flip is active right now, switch to no flipping
				this.flippedRadios.item(0).checked = true;
			}
		} else if (this.randomizePropertiesToggle.checked) {
			this.flippedRadios.item(Utils.randomInt(0, 3)).checked = true;
		}
	}

	if (Utils.getUrlParameter(Constants.MODE_PARAMETERS.GROUND_TEXTURE_EDITOR)) {
		active = true;

		Preloading.registerPartial('partials/groundTexturePanel.html')
			.then(setupPanel.bind(GroundTexturePanel));
	}

	return GroundTexturePanel;
});