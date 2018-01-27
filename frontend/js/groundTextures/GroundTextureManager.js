define(['Environment', 'Preloading', 'Utils', './GroundTexture'], function (Environment, Preloading, Utils, GroundTexture) {
	const GroundTextureManager = {};

	const textures = [];
	let renderingStarted = false;

	GroundTextureManager.setup = function () {
		textures.forEach(function (texture) {
			texture.addToMap();
		});

		renderingStarted = true;
	};

	GroundTextureManager.placeTexture = function (parameters) {
		let newTexture = new GroundTexture(parameters);
		textures.push(newTexture);

		if (renderingStarted) {
			newTexture.addToMap();
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
				rotation: params.rotation.toFixed(3),
				flipped: params.flipped,
			}
		}), null, 4);
	};

	GroundTextureManager.getTextureCount = function () {
		return textures.length;
	};

	Preloading.registerPreload(Utils.makeRequest({
		method: 'GET',
		url: 'js/groundTextures/groundTextures.json' + Environment.getCacheBuster()
	}).then(groundTextures => {
		groundTextures = JSON.parse(groundTextures);

		console.info(groundTextures);
	}));

	return GroundTextureManager;
});