"use strict";

requirejs.config({
	paths: {
		schema_common: [
			'schema/common_generated',
			'../../api/schema/js/common_generated'
		],
		schema_server: [
			'schema/server_generated',
			'../../api/schema/js/server_generated'
		],
		schema_client: [
			'schema/client_generated',
			'../../api/schema/js/client_generated'
		],
		Two: '../vendor/two/two',
		'vendor/flatbuffers': '../vendor/flatbuffers-1.6.0',

		GameObject: 'gameObjects/_GameObject',
		MapEditor: 'mapEditor/_MapEditor',
		Develop: 'develop/_Develop'
	}
});

define(['Utils', 'Preloading'], function (Utils, Preloading) {
	Preloading.loadPartial('partials/loadingScreen.html')
		.then(function () {
			Preloading.loadingBar = document.getElementById('loadingBar');
			Preloading._import(
				// Graphics
				'Two',

				// other libraries
				'../vendor/tock',
				'vendor/flatbuffers',
				'natureOfCode/arrive/vehicle',

				// own libraries
				'../vendor/XieLongUtils',

				// API schema
				'schema_common',
				'schema_server',
				'schema_client',

				// Game Modules
				'SvgLoader',
				'backend/Backend',
				'backend/SnapshotFactory',
				'KeyEvents',
				'PointerEvents',
				'Controls',
				'Constants',
				'InjectedSVG',
				'GameObject',
				'gameObjects/Animals',
				'gameObjects/Resources',
				'gameObjects/Border',
				'gameObjects/Character',
				'gameObjects/Placeable',
				'develop/DebugCircle',
				'GameMapGenerator',
				'GameMapWithBackend',
				'items/Equipment',
				'items/Items',
				'items/ItemType',
				'items/Recipes',
				'items/RecipesHelper',
				'items/InventorySlot',
				'items/ClickableIcon',
				'items/Crafting',
				'items/Inventory',
				'VitalSigns',
				'Player',
				'GameMap',
				'MiniMap',
				'Camera',
				'Quadrants',
				'UserInterface',

				// Develop resources
				'develop/Fps',
				'develop/AABBs',
				'Develop',

				// Map Editor
				'mapEditor/QuadrantGrid',
				'MapEditor',

				// The Game
				// (you just lost it)
				'Game'
			);

			Preloading.executePreload();
		});


});
