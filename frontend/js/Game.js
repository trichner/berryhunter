'use strict';

define(['Events'], function (Events) {
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
			'Player',
			'Spectator',
			'GameObject',
			'userInterface/UserInterface',
			'userInterface/screens/StartScreen',
			'Chat',
			'Utils',
			'NamedGroup',
			'Constants',
			'ColorMatrixFilterExtension'
		], function (PIXI, MapEditor, Backend, Develop, GameMapWithBackend, MiniMap, DayCycle,
		             Player, Spectator, GameObject, UserInterface, StartScreen,
		             Chat, Utils, NamedGroup, Constants, ColorMatrixFilterExtension) {

			let setupPromises = [];
			let requireAsPromise = Utils.requireAsPromise;

			Game.loop = function (now) {
				if (Game.paused) {
					return;
				}

				requestAnimationFrame(Game.loop);

				Game.timeDelta = Game.timeSinceLastFrame(now);

				Game.render();

				Game._lastFrame = now;
			};

			Game.timeSinceLastFrame = function (now) {
				return now - Game._lastFrame;
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
				Game.player.init();
				Game.state = States.PLAYING;
				Events.trigger('game.playing', this);
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
				Events.trigger('game.death', Game);
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
				Game.layers.terrain.ground.addChild(baseTexture);
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
				const waterRect = new PIXI.Graphics();
				Game.layers.terrain.water.addChild(waterRect);

				waterRect.beginFill(0x287aff);
				waterRect.drawRect(0, 0, Game.width, Game.height);
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
					water: new NamedGroup('water'),
					ground: new NamedGroup('ground'),
					textures: new NamedGroup('textures'),
					resourceSpots: new NamedGroup('resourceSpots'),
				},
				placeables: {
					campfire: new NamedGroup('campfire'),
					chest: new NamedGroup('chest'),
					workbench: new NamedGroup('workbench'),
					furnace: new NamedGroup('furnace'),

					doors: new NamedGroup('doors'),
					walls: new NamedGroup('walls'),
					spikyWalls: new NamedGroup('spikyWalls'),
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
				},
				overlays: {
					vitalSignIndicators: new NamedGroup('vitalSignIndicators')
				}
				// UI Overlay is the highest layer, but not managed with pixi.js
			};

			Game.stage = new PIXI.Container();

			// Terrain Background
			Game.stage.addChild(Game.layers.terrain.water);

			Game.cameraGroup = new NamedGroup('cameraGroup');
			Game.stage.addChild(Game.cameraGroup);

			// Terrain Textures moving with the camera
			Game.cameraGroup.addChild(
				Game.layers.terrain.ground,
				Game.layers.terrain.textures,
				Game.layers.terrain.resourceSpots
			);

			// Lower Placeables
			Game.cameraGroup.addChild(
				Game.layers.placeables.campfire,
				Game.layers.placeables.chest,
				Game.layers.placeables.workbench,
				Game.layers.placeables.furnace,
				Game.layers.resources.berryBush
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
				Game.layers.placeables.walls,
				Game.layers.placeables.spikyWalls
			);

			// Resources
			Game.cameraGroup.addChild(
				Game.layers.resources.minerals,
				Game.layers.resources.trees
			);

			// Character Additions
			Game.cameraGroup.addChild(
				Game.layers.characterAdditions.craftProgress,
				Game.layers.characterAdditions.chatMessages,
			);

			// Vital Sign Indicators on top of everything
			// And not part of the night filter container
			Game.stage.addChild(Game.layers.overlays.vitalSignIndicators);

			createBackground();

			setupPromises.push(requireAsPromise([
				'Camera',
				'VitalSigns',
				'items/Recipes',
				'Scoreboard',
				'groundTextures/GroundTextureManager',
			]).then(function (dependencies) {
				let Camera = dependencies[0];
				let VitalSigns = dependencies[1];
				let Recipes = dependencies[2];
				let Scoreboard = dependencies[3];
				let GroundTextureManager = dependencies[4];

				Camera.setup();
				VitalSigns.setup(Game.layers.overlays.vitalSignIndicators);
				Recipes.setup();
				Scoreboard.setup();
				GroundTextureManager.setup();
			}));

			/**
			 * @type GameMap|GameMapWithBackend
			 */
			Game.map = null;

			let domElement = Game.renderer.view;
			Game.domElement = domElement;
			GameObject.setup(domElement);
			DayCycle.setup(domElement, [
				Game.layers.terrain.water,
				Game.layers.terrain.ground,
				Game.layers.terrain.textures,
				Game.layers.terrain.resourceSpots,
				Game.layers.placeables.chest,
				Game.layers.placeables.workbench,
				Game.layers.resources.berryBush,
				Game.layers.characters,
				Game.layers.mobs.dodo,
				Game.layers.mobs.saberToothCat,
				Game.layers.mobs.mammoth,
				Game.layers.placeables.doors,
				Game.layers.placeables.walls,
				Game.layers.placeables.spikyWalls,
				Game.layers.resources.minerals,
				Game.layers.resources.trees,
				Game.layers.characterAdditions.craftProgress,
				Game.layers.characterAdditions.chatMessages
			]);

			setupPromises.push(requireAsPromise(['input/InputManager']).then(function (dependencies) {
				let InputManager = dependencies[0];
				Game.input = new InputManager(Game, {
					inputKeyboard: true,
					inputKeyboardEventTarget: window,

					inputMouse: true,
					inputMouseEventTarget: document.documentElement,
					inputMouseCapture: true,

					inputTouch: true,
					inputTouchEventTarget: document.documentElement,
					inputTouchCapture: true,

					inputGamepad: false,
				});
				Game.input.boot();
			}));

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
			setupPromises.push(requireAsPromise(['groundTextures/_Panel']).then(function (dependencies) {
				let GroundTexturePanel = dependencies[0];
				GroundTexturePanel.setup();
			}));

			if (Develop.isActive()) {
				Develop.afterSetup(Game);
			}

			if (MapEditor.isActive()) {
				MapEditor.afterSetup(Game);
			}

			Promise.all(setupPromises).then(function () {
				Events.triggerOneTime('gameSetup', Game);
			});
		});
	};


	Game.relativeWidth = function (value) {
		return value * Game.width / 100;
	};

	Game.relativeHeight = function (value) {
		return value * Game.height / 100;
	};

	Events.on('modulesLoaded', Game.setup);

	return Game;
});