'use strict';

// TODO Does webpack handle circular dependencies?

// TODO vendor
import * as PIXI from './PIXI';

import * as Preloading from './Preloading';
import * as MapEditor from './mapEditor/_MapEditor';
import * as Backend from './backend/Backend';
import * as Develop from './develop/_Develop';
import * as GameMapWithBackend from './backend/GameMapWithBackend';
import * as MiniMap from './MiniMap';
import * as DayCycle from './DayCycle';
import * as Player from './Player';
import * as Spectator from './Spectator';
import GameObject from './gameObjects/_GameObject';
import * as UserInterface from './userInterface/UserInterface';
import * as Chat from './Chat';
import * as NamedGroup from './NamedGroup';
import {BasicConfig as Constants} from '../config/Basic';

import * as Events from './Events';


export const States = {
		INITIALIZING: 'INITIALIZING',
		RENDERING: 'RENDERING',
		PLAYING: 'PLAYING'
	};


export let state = States.INITIALIZING;

export let renderer;
export let width, height;
export let centerX, centerY;
export let layers;
export let stage;
export let cameraGroup;

export let map: GameMapWithBackend  = null;

export function setup () {


			let setupPromises = [];

			

			if (MapEditor.isActive()) {
				/**
				 * @type PIXI.WebGLRenderer
				 */
				renderer = MapEditor.setup();
			} else {
				// Setup backend first, as this will take some time to connect.
				Backend.setup();

				renderer = PIXI.autoDetectRenderer({
					antialias: true,
					backgroundColor: 0x006030
				});

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

			width = renderer.width;
			height = renderer.height;

			centerX = width / 2;
			centerY = height / 2;

			/**
			 * Ordered by z-index
			 */
			// TODO: Grids, Borders, AABBs?
			layers = {
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

			stage = new PIXI.Container();

			// Terrain Background
			stage.addChild(layers.terrain.water);

			cameraGroup = new NamedGroup('cameraGroup');
			stage.addChild(cameraGroup);

			// Terrain Textures moving with the camera
			cameraGroup.addChild(
				layers.terrain.ground,
				layers.terrain.textures,
				layers.terrain.resourceSpots
			);

			// Lower Placeables
			cameraGroup.addChild(
				layers.placeables.campfire,
				layers.placeables.chest,
				layers.placeables.workbench,
				layers.placeables.furnace,
				layers.resources.berryBush
			);

			// Characters
			cameraGroup.addChild(layers.characters);

			// Mobs
			cameraGroup.addChild(
				layers.mobs.dodo,
				layers.mobs.saberToothCat,
				layers.mobs.mammoth
			);

			// Higher Placeables
			cameraGroup.addChild(
				layers.placeables.doors,
				layers.placeables.walls,
				layers.placeables.spikyWalls
			);

			// Resources
			cameraGroup.addChild(
				layers.resources.minerals,
				layers.resources.trees
			);

			// Character Additions
			cameraGroup.addChild(
				layers.characterAdditions.craftProgress,
				layers.characterAdditions.chatMessages,
			);

			// Vital Sign Indicators on top of everything
			// And not part of the night filter container
			stage.addChild(layers.overlays.vitalSignIndicators);

			createBackground();

			setupPromises.push(Preloading.requireAsPromise([
				'Camera',
				'VitalSigns',
				'items/Recipes',
				'scores/Scoreboard',
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
	}


export function relativeWidth (value) {
		return value * Game.width / 100;
	};

export function relativeHeight (value) {
		return value * Game.height / 100;
	};

export function loop (now) {
    if (Game.paused) {
        return;
    }

    requestAnimationFrame(Game.loop);

    Game.timeDelta = Game.timeSinceLastFrame(now);

    Game.render();

    Game._lastFrame = now;
};

export function timeSinceLastFrame (now) {
    return now - Game._lastFrame;
};

export function play () {
    Game.playing = true;
    Game.paused = false;
    Game._lastFrame = performance.now();
    Game.loop();
};

export function pause () {
    Game.playing = false;
    Game.paused = true;
};

export function render () {
    Game.renderer.render(Game.stage);
};

/**
 * Creating a player starts implicitly the game
 */
export function createPlayer (id, x, y, name) {
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
    Events.trigger('game.playing', Game);
};

export function removePlayer () {
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

export function createSpectator (x, y) {
    Game.spectator = new Spectator(x, y);
};

/**
 *
 * @param {{mapRadius: number}} gameInformation
 */
export function startRendering (gameInformation) {
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

	Events.on('modulesLoaded', Game.setup);
