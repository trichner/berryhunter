'use strict';

define(['Environment', 'Preloading', 'GraphicsConfig'], function (Environment, Preloading, GraphicsConfig) {

	const GroundTextureTypes = GraphicsConfig.groundTextureTypes;

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

	console.log("GroundTextureTypes init done");
	return GroundTextureTypes;
});