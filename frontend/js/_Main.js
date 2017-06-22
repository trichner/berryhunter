"use strict";

requirejs.config({
	paths: {
		Game: '_Main',

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

		GameObject: 'gameObjects/_GameObject',
		MapEditor: 'mapEditor/_MapEditor',
		Develop: 'develop/_Develop'
	}
});

define(['Utils', 'Preloading'], function (Utils, Preloading) {

	Preloading.loadPartial('partials/loadingScreen.html')
		.then(function () {
			Preloading.loadingBar = document.getElementById('loadingBar');
			console.log('Loading Bar loaded');

			setTimeout(function () {

				Preloading._import(
					// Graphics
					'Two',

					// other libraries
					'../vendor/tock',
					'../vendor/flatbuffers-1.6.0',
					'natureOfCode/arrive/vehicle',

					// own libraries
					'../vendor/XieLongUtils',

					// API schema
					'schema_common',
					'schema_server',
					'schema_client',

					// Game Modules
					'SvgLoader',
					'Backend',
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
					'items/Recipes',
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
					'mapEditor/QuadrantGrid',

					// Develop resources
					'develop/Fps',
					'develop/AABBs',
					'Develop',

					// Map Editor
					'mapEditor/_MapEditor'
				);

				Preloading.executePreload()
					.then(() => {
						setup();
					});

			}, 10);

		});

	// TODO wie returned man hier das initialisierte Game? Ist das nötig? wer wartet auf wen!?
	let Game = {};

	Game.started = false;

	function setup() {
		require([
			'Two',
			'MapEditor',
			'Backend',
			'Develop',
			'GameMapWithBackend',
			'MiniMap',
			'SvgLoader',
			'KeyEvents',
			'PointerEvents'
		], function (Two, MapEditor, Backend, Develop, GameMapWithBackend, MiniMap, SvgLoader, KeyEvents, PointerEvents) {
			function createBackground() {
				const background = new Two.Rectangle(width / 2, height / 2, width, height);
				groups.background.add(background);
				background.fill = 'rgb(0, 96, 48)';
				background.noStroke();
			}

			if (MapEditor.isActive()) {
				/**
				 * @type Two
				 */
				Game.two = MapEditor.setup();
			} else {
				// Setup backend first, as this will take some time to connect.
				Backend.setup();
				Game.two = new Two({
					fullscreen: true,
					type: Two.Types.svg
				});
				document.body.insertBefore(
					Game.two.renderer.domElement,
					document.body.firstChild);
			}

			Game.width = Game.two.width;
			Game.height = Game.two.height;

			Game.centerX = width / 2;
			Game.centerY = height / 2;

			/**
			 * Ordered by z-index
			 */
			Game.groups = {};

			Game.groups.background = Game.two.makeGroup();
			Game.groups.character = Game.two.makeGroup();
			Game.groups.mapBorders = Game.two.makeGroup();
			Game.groups.gameObjects = Game.two.makeGroup();
			Game.groups.overlay = Game.two.makeGroup();

			createBackground();

			// TODO if offline createPlayer
			// player = new Character(1, width / 2, height / 2);
			// playerCam = new Camera(player);

			/**
			 * @type GameMap|GameMapWithBackend
			 */
			Game.map = new GameMapWithBackend();

			/**
			 * @type MiniMap
			 */
			Game.miniMap = new MiniMap(Game.map);

			if (Develop.isActive()) {
				Develop.onTwoAvailable(Game.two);
			}

			let domElement = Game.two.renderer.domElement;
			SvgLoader.setup(domElement);
			KeyEvents.setup(domElement);
			PointerEvents.setup(domElement);

			// Disable context menu on right click to use the right click ingame
			document.body.addEventListener('contextmenu', function (event) {
				if (event.target === domElement || domElement.contains(event.target)) {
					event.preventDefault();
				}
			});
			domElement.addEventListener('blur', function () {
				Game.two.pause();
			});
			domElement.addEventListener('focus', function () {
				if (Game.started) {
					Game.two.play();
				}
			});

			if (MapEditor.isActive()) {
				MapEditor.afterSetup();
			}

			document.body.classList.remove('loading');
		});
	}

	/**
	 * Creating a player starts implicitly the game
	 */
	Game.createPlayer = function (id, x, y) {
		/**
		 * @type Player
		 */
		Game.player = new Player(id, x, y);
		Game.two.play();
	};

	return Game;
});
