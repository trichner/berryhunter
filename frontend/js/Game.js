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
			'MapEditor',
			'backend/Backend',
			'Develop',
			'backend/GameMapWithBackend',
			'MiniMap',
			'DayCycle',
			'SvgLoader',
			'KeyEvents',
			'PointerEvents',
			'Player',
			'Spectator',
			'GameObject',
			'items/RecipesHelper',
			'UserInterface',
			'StartScreen',
			'Chat',
			'Utils'
		], function (Two, MapEditor, Backend, Develop, GameMapWithBackend, MiniMap, DayCycle, SvgLoader, KeyEvents,
		             PointerEvents, Player, Spectator, GameObject, RecipesHelper, UserInterface, StartScreen, Chat, Utils) {
			/**
			 * Creating a player starts implicitly the game
			 */
			Game.createPlayer = function (id, x, y, name) {
				if (Utils.isDefined(Game.spectator)) {
					Game.spectator.remove();
					delete Game.spectator;
				}

				/**
				 * @type Player
				 */
				Game.player = new Player(id, x, y, name);
				Game.state = States.PLAYING;
			};

			Game.removePlayer = function () {
				Game.createSpectator(Game.player.character.getX(), Game.player.character.getY());
				Game.player.remove();
				delete Game.Player;
				Game.state = States.RENDERING;
			};

			Game.createSpectator = function (x, y) {
				Game.spectator = new Spectator(x, y);
			};

			/**
			 *
			 * @param {{mapRadius: number}} gameInformation
			 */
			Game.startRendering = function (gameInformation) {
				const baseTexture = new Two.Ellipse(0, 0, gameInformation.mapRadius);
				Game.layers.terrain.textures.add(baseTexture);
				baseTexture.fill = 'rgb(0, 96, 48)';
				baseTexture.noStroke();

				Game.map = new GameMapWithBackend(gameInformation.mapRadius);
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
				background.fill = '#287aff';
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
					background: new Two.Group(),
					textures: new Two.Group(),
				},
				placeables: {
					campfire: new Two.Group(),
					chest: new Two.Group(),
					workbench: new Two.Group(),
					furnace: new Two.Group(),

					doors: new Two.Group(),
					walls: new Two.Group(),
				},
				characters: new Two.Group(),
				mobs: {
					dodo: new Two.Group(),
					saberToothCat: new Two.Group(),
					mammoth: new Two.Group(),
				},
				resources: {
					berryBush: new Two.Group(),
					minerals: new Two.Group(),
					trees: new Two.Group(),
				}
				// UI Overlay is the highest layer, but not managed with Two.js
			};

			// Terrain
			Game.two.makeGroup(
				Game.layers.terrain.background);

			Game.cameraGroup = Game.two.makeGroup();

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

			require(['Camera'], function (Camera) {
				Camera.setup();
			});
			GameObject.setup();
			RecipesHelper.setup();

			/**
			 * @type GameMap|GameMapWithBackend
			 */
			Game.map = null;

			let domElement = Game.two.renderer.domElement;
			Game.domElement = domElement;
			DayCycle.setup(domElement, Game.two.scene);
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