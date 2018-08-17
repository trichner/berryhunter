'use strict';

requirejs.config({
	paths: {
		PIXI: '../vendor/pixijs/pixi.min',
		'pixi-ease': '../vendor/pixijs/plugins/pixi-ease',
		'vendor/flatbuffers': '../vendor/flatbuffers',
		underscore: '../vendor/underscore.min',
		saveAs: '../vendor/FileSaver.min',

		GameObject: 'gameObjects/_GameObject',
		MapEditor: 'mapEditor/_MapEditor',
		Develop: 'develop/_Develop',
		Constants: '../config/Basic',
		GraphicsConfig: '../config/Graphics',
	},

	shim: {
		'underscore': {
			exports: '_',
		},
		saveAs: {
			exports: 'saveAs',
		},
		'pixi-ease': {
			deps: ['PIXI'],
			exports: 'PIXI.extras.Ease'
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


define(['Preloading', 'Events'], function (Preloading, Events) {
	/*
	 * Require all Modules, to create a reasonable loading bar.
	 */
	Preloading.executePreload([
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

		'Constants',
		'GraphicsConfig',
		'../config/Items',

		'backend/Backend',
		'backend/BackendConstants',
		'backend/ClientMessage',
		'backend/GameMapWithBackend',
		'backend/GameState',
		'backend/ScoreboardMessage',
		'backend/SnapshotFactory',
		'backend/Welcome',

		'Develop',
		'develop/AABBs',
		'develop/DebugCircle',
		'develop/Fps',

		'GameObject',
		'gameObjects/AnimateAction',
		'gameObjects/Border',
		'gameObjects/Character',
		'gameObjects/Mobs',
		'gameObjects/Placeable',
		'gameObjects/Resources',

		'groundTextures/_Panel',
		'groundTextures/GroundTexture',
		'groundTextures/GroundTextureManager',
		'groundTextures/GroundTextureTypes',

		'input/keyboard/combo/AdvanceKeyCombo',
		'input/keyboard/combo/KeyCombo',
		'input/keyboard/combo/ProcessKeyCombo',
		'input/keyboard/combo/ResetKeyCombo',
		'input/keyboard/keys/DownDuration',
		'input/keyboard/keys/JustDown',
		'input/keyboard/keys/JustUp',
		'input/keyboard/keys/Key',
		'input/keyboard/keys/KeyCodes',
		'input/keyboard/keys/ProcessKeyDown',
		'input/keyboard/keys/ProcessKeyUp',
		'input/keyboard/keys/ResetKey',
		'input/keyboard/keys/UpDuration',
		'input/keyboard/KeyboardManager',
		'input/mouse/MouseManager',
		'input/InputManager',
		'input/Pointer',

		'items/Crafting',
		'items/Equipment',
		'items/Inventory',
		'items/InventoryListeners',
		'items/InventoryShortcuts',
		'items/InventorySlot',
		'items/Items',
		'items/ItemType',
		'items/Recipes',

		'MapEditor',
		'mapEditor/QuadrantGrid',

		'natureOfCode/arrive/vehicle',

		'scores/Scoreboard',
		'scores/HighScores',

		'userInterface/screens/EndScreen',
		'userInterface/screens/StartScreen',
		'userInterface/ClickableCountableIcon',
		'userInterface/ClickableIcon',
		'userInterface/SubIcon',
		'userInterface/UserInterface',
		'userInterface/VitalSignBar',

		'AutoFeed',
		'BrowserConsole',
		'Camera',
		'Chat',
		'ColorMatrixFilterExtension',
		'Console',
		'Controls',
		'DayCycle',
		'Environment',
		'Events',
		'Game',
		'GameMap',
		'GameMapGenerator',
		'InjectedSVG',
		'MiniMap',
		'NamedGroup',
		'NameGenerator',
		'Player',
		'PlayerName',
		'Preloading',
		'Quadrants',
		'Spectator',
		'Text',
		'Tutorial',
		'Utils',
		'Vector',
		'VitalSigns',
	]).then(function () {
		Events.triggerOneTime('modulesLoaded');
	});

});
