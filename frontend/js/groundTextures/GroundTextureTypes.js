define(['Environment', 'Preloading'], function (Environment, Preloading) {
	/**
	 * Contains informations about types of ground textures that are available for placing.
	 */
	const GroundTextureTypes = {
		'Grass, dark green': {
			file: 'darkGreenGrass',
			minSize: 80,
			maxSize: 300,
		},
		'Grass, light green': {
			file: 'lightGreenGrass',
			minSize: 80,
			maxSize: 300,
		},
		'Flowers': {
			file: 'flowers',
			minSize: 50,
			maxSize: 100,
		},
		'Stone Patch': {
			file: 'stonePatch',
			minSize: 100,
			maxSize: 300,
		},
	};

	// Validate
	let hasError = false;
	for (let type in GroundTextureTypes) {
		let groundTextureType = GroundTextureTypes[type];
		groundTextureType.name = type;

		if (!groundTextureType.hasOwnProperty('file')) {
			console.error("GroundTextureType '" + type +
				"' needs field 'file' with the file name " +
				"for the texture graphic.");
			hasError = true;
		}
		if (!groundTextureType.hasOwnProperty('minSize')) {
			console.error("GroundTextureType '" + type +
				"' needs field 'minSize' which determines " +
				"the minimal random size in the panel.");
			hasError = true;
		}
		if (!groundTextureType.hasOwnProperty('maxSize')) {
			console.error("GroundTextureType '" + type +
				"' needs field 'maxSize' which determines " +
				"the minimal random size in the panel.");
			hasError = true;
		}

		/*
		 * Type is valid - preload the texture graphic
		 */
		if (!hasError){
			groundTextureType.path = 'img/groundTextures/' + groundTextureType.file + '.svg' + Environment.getCacheBuster();
			Preloading.registerGameObjectSVG(groundTextureType, groundTextureType.path, groundTextureType.maxSize);
		}
	}

	if (hasError){
		throw "There are erroneous GroundTextureType(s).";
	}

	return GroundTextureTypes;
});