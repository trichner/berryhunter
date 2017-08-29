"use strict";

define([], function () {
	let Game = {};

	const States = {
		INITIALIZING: 'INITIALIZING',
		RENDERING: 'RENDERING',
		PLAYING: 'PLAYING'
	};

	Game.States = States;

	Game.state = States.INITIALIZING;

	Game.setup = function () {
		require([
			'Two',
			'NamedGroup',
			'MapEditor',
			'backend/Backend',
			'Develop',
			'backend/GameMapWithBackend',
			'MiniMap',
			'SvgLoader',
			'KeyEvents',
			'PointerEvents',
			'Player',
			'GameObject',
			'items/RecipesHelper',
			'UserInterface',
			'StartScreen',
			'Chat'
		], function (Two, NamedGroup, MapEditor, Backend, Develop, GameMapWithBackend, MiniMap, SvgLoader, KeyEvents, PointerEvents, Player, GameObject, RecipesHelper, UserInterface, StartScreen, Chat) {
			/**
			 * Creating a player starts implicitly the game
			 */
			Game.createPlayer = function (id, x, y, name) {
				/**
				 * @type Player
				 */
				Game.player = new Player(id, x, y, name);
				Game.state = States.PLAYING;
			};

			Game.removePlayer = function () {
				Game.player.remove();
				delete Game.Player;
				Game.state = States.RENDERING;
			};

			/**
			 *
			 * @param {{mapWidth: number, mapHeight: number}} gameInformation
			 */
			Game.startRendering = function (gameInformation) {
				Game.map = new GameMapWithBackend(gameInformation.mapWidth, gameInformation.mapHeight);
				Game.two.play();
				Game.state = States.RENDERING;
				/**
				 * @type MiniMap
				 */
				Game.miniMap = new MiniMap(Game.map.width, Game.map.height);
			};

			function createBackground() {
				const background = new Two.Rectangle(Game.width / 2, Game.height / 2, Game.width, Game.height);
				Game.layers.terrain.background.add(background);
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

			Game.centerX = Game.width / 2;
			Game.centerY = Game.height / 2;

			/**
			 * Ordered by z-index
			 */
			// TODO: Grids, Borders, AABBs?
			Game.layers = {
				terrain: {
					background: new NamedGroup('background'),
					textures: new NamedGroup('textures'),
				},
				placeables: {
					campfire: new NamedGroup(''),
					chest: new NamedGroup('chest'),
					workbench: new NamedGroup('workbench'),
					furnace: new NamedGroup('furnace'),

					doors: new NamedGroup('doors'),
					walls: new NamedGroup('walls'),
				},
				characters: new NamedGroup('characters'),
				mobs: {
					dodo: new NamedGroup('dodo'),
					saberToothCat: new NamedGroup('saberToothCat'),
					mammoth: new NamedGroup('mammoth'),
				},
				resources: {
					berryBush: new NamedGroup('berryBush'),
					minerals: new NamedGroup('minerals'),
					trees: new NamedGroup('trees'),
				}
				// UI Overlay is the highest layer, but not managed with Two.js
			};

			// Terrain
			let terrain = Game.two.makeGroup(
				Game.layers.terrain.background);
			NamedGroup.nameGroup(terrain, 'terrain');

			Game.cameraGroup = Game.two.makeGroup();
			NamedGroup.nameGroup(Game.cameraGroup, 'cameraGroup');

			// Terrain Textures moving with the camera
			Game.cameraGroup.add(
				Game.layers.terrain.textures
			);

			// Lower Placeables
			Game.cameraGroup.add(
				Game.layers.placeables.campfire,
				Game.layers.placeables.chest,
				Game.layers.placeables.workbench,
				Game.layers.placeables.furnace
			);

			// Characters
			Game.cameraGroup.add(Game.layers.characters);

			// Mobs
			Game.cameraGroup.add(
				Game.layers.mobs.dodo,
				Game.layers.mobs.saberToothCat,
				Game.layers.mobs.mammoth
			);

			// Higher Placeables
			Game.cameraGroup.add(
				Game.layers.placeables.doors,
				Game.layers.placeables.walls
			);

			// Resources
			Game.cameraGroup.add(
				Game.layers.resources.berryBush,
				Game.layers.resources.minerals,
				Game.layers.resources.trees
			);

			createBackground();

			GameObject.setup();
			RecipesHelper.setup();

			/**
			 * @type GameMap|GameMapWithBackend
			 */
			Game.map = null;

			let domElement = Game.two.renderer.domElement;
			Game.domElement = domElement;
			SvgLoader.setup(domElement);
			KeyEvents.setup(domElement);
			PointerEvents.setup(domElement);

			// Disable context menu on right click to use the right click ingame
			document.body.addEventListener('contextmenu', function (event) {
				if (event.target === domElement || domElement.contains(event.target)) {
					event.preventDefault();
				}
			});
			if (MapEditor.isActive()) {
				domElement.addEventListener('blur', function () {
					Game.two.pause();
				});
				domElement.addEventListener('focus', function () {
					if (Game.started) {
						Game.two.play();
					}
				});
			}

			UserInterface.setup();

			/*
			 * Initializing modules that require an initialized UI
			 */

			Chat.setup();

			StartScreen.show();

			if (Develop.isActive()) {
				Develop.afterSetup(Game);
			}

			if (MapEditor.isActive()) {
				MapEditor.afterSetup(Game);
			}

			window.Game = Game;
		});
	};


	Game.relativeWidth = function (value) {
		return value * Game.width / 100;
	};

	Game.relativeHeight = function (value) {
		return value * Game.height / 100;
	};

	return Game;
});