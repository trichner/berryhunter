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
			'PIXI',
			'MapEditor',
			'backend/Backend',
			'Develop',
			'backend/GameMapWithBackend',
			'MiniMap',
			'DayCycle',
			'KeyEvents',
			'PointerEvents',
			'Player',
			'Spectator',
			'GameObject',
			'items/RecipesHelper',
			'UserInterface',
			'StartScreen',
			'Chat',
			'Utils',
			'NamedGroup',
			'Constants',
			'ColorMatrixFilterExtension'
		], function (PIXI, MapEditor, Backend, Develop, GameMapWithBackend, MiniMap, DayCycle, KeyEvents,
		             PointerEvents, Player, Spectator, GameObject, RecipesHelper, UserInterface, StartScreen, Chat,
		             Utils, NamedGroup, Constants, ColorMatrixFilterExtension) {

			Game.loop = function (now) {
				if (Game.paused) {
					return;
				}

				requestAnimationFrame(Game.loop);

				Game.timeDelta = now - Game._lastFrame;

				Game.render();

				Game._lastFrame = now;
			};

			Game.play = function () {
				Game.playing = true;
				Game.paused = false;
				Game._lastFrame = performance.now();
				Game.loop();
			};

			Game.pause = function () {
				Game.playing = false;
				Game.paused = true;
			};

			Game.render = function () {
				Game.renderer.render(Game.stage);
			};

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
				if (Constants.CLEAR_MINIMAP_ON_DEATH) {
					Game.miniMap.clear();
					// Game.miniMap.stop();
					Game.map.clear();
				}
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
				const baseTexture = new PIXI.Graphics();
				Game.layers.terrain.textures.addChild(baseTexture);
				baseTexture.beginFill(0x006030);
				baseTexture.drawCircle(0, 0, gameInformation.mapRadius);

				Game.map = new GameMapWithBackend(gameInformation.mapRadius);
				Game.play();
				Game.state = States.RENDERING;
				/**
				 * @type MiniMap
				 */
				Game.miniMap = new MiniMap(Game.map.width, Game.map.height);
			};

			function createBackground() {
				const background = new PIXI.Graphics();
				Game.layers.terrain.background.addChild(background);

				background.beginFill(0x287aff);
				background.drawRect(0, 0, Game.width, Game.height);
			}

			if (MapEditor.isActive()) {
				/**
				 * @type PIXI.WebGLRenderer
				 */
				Game.renderer = MapEditor.setup();
			} else {
				// Setup backend first, as this will take some time to connect.
				Backend.setup();
				let renderer = PIXI.autoDetectRenderer({
					antialias: true,
					backgroundColor: 0x006030
				});
				Game.renderer = renderer;

				// Fullscreen
				renderer.view.style.position = "absolute";
				renderer.view.style.display = "block";
				renderer.autoResize = true;
				renderer.resize(window.innerWidth, window.innerHeight);

				//Add the canvas to the HTML document
				document.body.insertBefore(
					renderer.view,
					document.body.firstChild);
			}

			Game.width = Game.renderer.width;
			Game.height = Game.renderer.height;

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
					campfire: new NamedGroup('campfire'),
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
				},
				characterAdditions: {
					craftProgress: new NamedGroup('craftProgress'),
					chatMessages: new NamedGroup('chatMessages'),
				}
				// UI Overlay is the highest layer, but not managed with pixi.js
			};

			Game.stage = new PIXI.Container();

			// Terrain Background
			Game.stage.addChild(Game.layers.terrain.background);

			Game.cameraGroup = new NamedGroup('cameraGroup');
			Game.stage.addChild(Game.cameraGroup);

			// Terrain Textures moving with the camera
			Game.cameraGroup.addChild(
				Game.layers.terrain.textures
			);

			// Lower Placeables
			Game.cameraGroup.addChild(
				Game.layers.placeables.campfire,
				Game.layers.placeables.chest,
				Game.layers.placeables.workbench,
				Game.layers.placeables.furnace
			);

			// Characters
			Game.cameraGroup.addChild(Game.layers.characters);

			// Mobs
			Game.cameraGroup.addChild(
				Game.layers.mobs.dodo,
				Game.layers.mobs.saberToothCat,
				Game.layers.mobs.mammoth
			);

			// Higher Placeables
			Game.cameraGroup.addChild(
				Game.layers.placeables.doors,
				Game.layers.placeables.walls
			);

			// Resources
			Game.cameraGroup.addChild(
				Game.layers.resources.berryBush,
				Game.layers.resources.minerals,
				Game.layers.resources.trees
			);

			// Character Additions
			Game.cameraGroup.addChild(
				Game.layers.characterAdditions.craftProgress,
				Game.layers.characterAdditions.chatMessages,
			);

			createBackground();

			require(['Camera'], function (Camera) {
				Camera.setup();
			});
			RecipesHelper.setup();

			/**
			 * @type GameMap|GameMapWithBackend
			 */
			Game.map = null;

			let domElement = Game.renderer.view;
			Game.domElement = domElement;
			GameObject.setup(domElement);
			DayCycle.setup(domElement, Game.stage);
			KeyEvents.setup(window);
			PointerEvents.setup(window);

			// Disable context menu on right click to use the right click ingame
			document.body.addEventListener('contextmenu', function (event) {
				if (event.target === domElement || domElement.contains(event.target)) {
					event.preventDefault();
				}
			});
			if (MapEditor.isActive()) {
				domElement.addEventListener('blur', function () {
					Game.pause();
				});
				domElement.addEventListener('focus', function () {
					if (Game.started) {
						Game.play();
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