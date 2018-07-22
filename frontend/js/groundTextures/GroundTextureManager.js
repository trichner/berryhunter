'use strict';

define(['Environment', 'Preloading', 'Utils', './GroundTexture', './GroundTextureTypes'],
	function (Environment, Preloading, Utils, GroundTexture, GroundTextureTypes) {
		const GroundTextureManager = {};

		const textures = [];
		let renderingStarted = false;
		let latestTextureIndex;

		GroundTextureManager.setup = function () {
			textures.forEach(function (texture) {
				texture.addToMap();
			});

			renderingStarted = true;
		};

		GroundTextureManager.placeTexture = function (parameters) {
			let newTexture = new GroundTexture(parameters);
			latestTextureIndex = textures.push(newTexture) - 1;

			if (renderingStarted) {
				newTexture.addToMap();
			}
		};

		GroundTextureManager.removeLatestTexture = function () {
			if (Utils.isDefined(latestTextureIndex)) {
				let texture = textures[latestTextureIndex];
				textures.splice(latestTextureIndex, 1);
				if (renderingStarted) {
					texture.remove();
				}
				latestTextureIndex = undefined;
			}
		};

		GroundTextureManager.getTexturesAsJSON = function () {
			return JSON.stringify(textures.map(function (texture) {
				let params = texture.parameters;
				return {
					type: params.type.name,
					x: params.x,
					y: params.y,
					size: params.size,
					rotation: Math.round(params.rotation * 1000) / 1000, // Round to 3 digits
					flipped: params.flipped,
				}
			}), null, 2);
		};

		GroundTextureManager.getTextureCount = function () {
			return textures.length;
		};

		Preloading.registerPreload(Utils.makeRequest({
			method: 'GET',
			url: 'config/groundTextures.json' + Environment.getCacheBuster()
		}).then(function (groundTextures) {
			groundTextures = JSON.parse(groundTextures);

			groundTextures.forEach(function (groundTexture) {
				groundTexture.type = GroundTextureTypes[groundTexture.type];
				GroundTextureManager.placeTexture(groundTexture);
			});
		}));

		return GroundTextureManager;
	});