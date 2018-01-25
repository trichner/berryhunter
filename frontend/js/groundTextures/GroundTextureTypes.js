define([], function () {
	/**
	 * Contains informations about types of ground textures that are available for placing.
	 */
	const GroundTextureTypes = {
		'Grass, dark green': {
			file: 'darkGreenGrass',
			minSize: 200,
			maxSize: 500,
		},
		'Grass, light green': {
			file: 'lightGreenGrass',
			minSize: 200,
			maxSize: 500,
		},
		'Flowers': {
			file: 'flowers',
			minSize: 200,
			maxSize: 250,
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
	}

	return GroundTextureTypes;
});