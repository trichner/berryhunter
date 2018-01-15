"use strict";

requirejs.config({
	paths: {
		PIXI: '../vendor/pixi.min',
		'vendor/flatbuffers': '../vendor/flatbuffers',
		underscore: '../vendor/underscore-min',
		saveAs: '../vendor/FileSaver.min',

		GameObject: 'gameObjects/_GameObject',
		MapEditor: 'mapEditor/_MapEditor',
		Develop: 'develop/_Develop',
	},

	shim: {
		'underscore': {
			exports: '_',
		},
		saveAs: {
			exports: 'saveAs',
		}
	},
});

require(['Environment'], function (Environment) {

	requirejs.config({
		paths: {
			schema_common: Environment.subfolderPath() ?
				'../../api/schema/js/common_generated' :
				'schema/common_generated',
			schema_server: Environment.subfolderPath() ?
				'../../api/schema/js/server_generated' :
				'schema/server_generated',
			schema_client: Environment.subfolderPath() ?
				'../../api/schema/js/client_generated' :
				'schema/client_generated',
		},
	});

// Disable caching
	if (Environment.cachingEnabled()) {
		requirejs.config({
			urlArgs: '' + (new Date()).getTime(),
		})
	}
});


define(['Utils', 'Preloading'], function (Utils, Preloading) {
	Preloading.loadPartial('partials/loadingScreen.html')
		.then(function () {
			Preloading.loadingBar = document.getElementById('loadingBar');
			/*
			 * Require all Modules, to create a reasonable loading bar.
			 */
			require([
					// Graphics
					'PIXI',

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
					'backend/Backend',
					'backend/BackendConstants',
					'backend/ClientMessage',
					'backend/Welcome',
					'backend/SnapshotFactory',
					'Controls',
					'Constants',
					'InjectedSVG',
					'GameObject',
					'gameObjects/Mobs',
					'gameObjects/Resources',
					'gameObjects/Border',
					'gameObjects/Character',
					'gameObjects/Placeable',
					'develop/DebugCircle',
					'GameMapGenerator',
					'backend/GameMapWithBackend',
					'items/Equipment',
					'items/Items',
					'items/ItemType',
					'items/Recipes',
					'items/RecipesHelper',
					'items/InventorySlot',
					'items/Crafting',
					'items/Inventory',
					'VitalSigns',
					'Player',
					'GameMap',
					'MiniMap',
					'Camera',
					'Quadrants',
					'UserInterface',
					'StartScreen',
					'NameGenerator',
					'EndScreen',
					'Console',
					'Chat',
					'NamedGroup',
					'DayCycle',
					'Spectator',
					'FilterPool',
					'Vector',
					'ColorMatrixFilterExtension',
					'PlayerName',
					'Text',
					'groundTextures/GroundTexture',
					'groundTextures/GroundTextureTypes',
					'groundTextures/GroundTextureManager',
					'input/Inputs',

					// Develop resources
					'develop/Fps',
					'develop/AABBs',
					'Develop',

					// Map Editor
					'mapEditor/QuadrantGrid',
					'MapEditor',

					// Ground Texture Panel
					'groundTextures/_Panel',

					// The Game
					// (you just lost it)
					'Game',
				], function () {
					/*
					 * All modules had a chance to register preloads - now setup waits for those reloads to resolve.
					 */
					Preloading.executePreload().then(() => {
						require(['Game'], function (Game) {
							Game.setup();
						});
					});
				},
			);
		});


});
