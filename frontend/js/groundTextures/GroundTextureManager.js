define(['Environment', 'Preloading', 'Utils', './GroundTexture'], function (Environment, Preloading, Utils, GroundTexture) {
	const GroundTextureManager = {};

	const textures = [];
	let renderingStarted = false;

	GroundTextureManager.setup = function () {
		// TODO add all elements of textures to correct layer
		renderingStarted = true;
	};

	GroundTextureManager.placeTexture = function (parameters) {
		let newTexture = new GroundTexture(parameters);
		textures.push(newTexture)
		// TODO add to correct layer
	};

	// Disable caching
	let cacheBuster = '';
	if (Environment.cachingEnabled()) {
		cacheBuster = '?' + (new Date()).getTime();
	}
	Preloading.registerPreload(Utils.makeRequest({
		method: 'GET',
		url: 'js/groundTextures/groundTextures.json' + cacheBuster
	}).then(groundTextures => {
		groundTextures = JSON.parse(groundTextures);

		console.info(groundTextures);
	}));

	return GroundTextureManager;
});