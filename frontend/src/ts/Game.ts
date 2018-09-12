'use strict';

import * as PIXI from 'pixi.js';
import * as Backend from './backend/Backend';
import {GameMapWithBackend} from './backend/GameMapWithBackend';
import * as Develop from './develop/_Develop';
import {MiniMap} from './MiniMap';
import * as DayCycle from './DayCycle';
import {Player} from './Player';
import {Spectator} from './Spectator';
import {GameObject} from './gameObjects/_GameObject';
import * as UserInterface from './userInterface/UserInterface';
import * as Chat from './Chat';
import {NamedGroup} from './NamedGroup';
import {BasicConfig as Constants} from '../config/Basic';
import {InputManager} from './input/InputManager';
import * as Events from './Events';
import * as GroundTexturePanel from './groundTextures/_Panel';
import {isDefined} from './Utils';
import {Welcome} from "./backend/Welcome";
import * as Console from './Console';
import {Camera} from './Camera';
import {VitalSigns} from './VitalSigns';
import * as Recipes from './items/Recipes';
import * as Scoreboard from './scores/Scoreboard';
import * as GroundTextureManager from './groundTextures/GroundTextureManager';

// Assign all export in this file to a single variable to be passed into sub modules.
import * as Game from './Game';

export const States = {
    INITIALIZING: 'INITIALIZING',
    RENDERING: 'RENDERING',
    PLAYING: 'PLAYING'
};


export let state = States.INITIALIZING;

export let renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
export let width, height;
export let centerX, centerY;
export let layers;
export let stage;
export let cameraGroup: PIXI.Container;

export let map: GameMapWithBackend = null;
export let miniMap: MiniMap = null;

export let domElement;
export let input;

// TODO merge with GameState?
export let started;
export let paused;
export let playing;

export let timeDelta;
let _lastFrame;

export let spectator;
export let player;

export function setup() {


    let setupPromises = [];


    // Setup backend first, as this will take some time to connect.
    Backend.setup(Game);

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

    width = renderer.width;
    height = renderer.height;

    centerX = width / 2;
    centerY = height / 2;

    /**
     * Ordered by z-index
     */
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

    Camera.setup(Game);
    VitalSigns.setup(Game, layers.overlays.vitalSignIndicators);
    Recipes.setup(Game);
    Scoreboard.setup();
    GroundTextureManager.setup();

    domElement = renderer.view;
    GameObject.setup(Game);
    DayCycle.setup(domElement, [
        layers.terrain.water,
        layers.terrain.ground,
        layers.terrain.textures,
        layers.terrain.resourceSpots,
        layers.placeables.chest,
        layers.placeables.workbench,
        layers.resources.berryBush,
        layers.characters,
        layers.mobs.dodo,
        layers.mobs.saberToothCat,
        layers.mobs.mammoth,
        layers.placeables.doors,
        layers.placeables.walls,
        layers.placeables.spikyWalls,
        layers.resources.minerals,
        layers.resources.trees,
    ]);

    input = new InputManager({
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
    input.boot();

    // Disable context menu on right click to use the right click ingame
    document.body.addEventListener('contextmenu', function (event) {
        if (event.target === domElement || domElement.contains(event.target)) {
            event.preventDefault();
        }
    });


    UserInterface.setup(Game);

    /*
     * Initializing modules that require an initialized UI
     */

    Chat.setup(Game);
    GroundTexturePanel.setup(Game);

    if (Develop.isActive()) {
        Develop.afterSetup(Game);
    }


    Promise.all(setupPromises).then(function () {
        Events.triggerOneTime('game.setup', Game);
    });
}

export function loop(now) {
    if (paused) {
        return;
    }

    requestAnimationFrame(loop);

    timeDelta = timeSinceLastFrame(now);

    render();

    _lastFrame = now;
}

export function timeSinceLastFrame(now) {
    return now - _lastFrame;
}

export function play() {
    playing = true;
    paused = false;
    _lastFrame = performance.now();
    loop(_lastFrame);
}

export function pause() {
    playing = false;
    paused = true;
}

export function render() {
    renderer.render(stage);
}

/**
 * Creating a player starts implicitly the game
 */
export function createPlayer(id, x, y, name) {
    if (isDefined(spectator)) {
        spectator.remove();
        spectator = undefined;
    }

    /**
     * @type Player
     */
    player = new Player(id, x, y, name, miniMap);
    player.init();
    state = States.PLAYING;
    Events.trigger('game.playing');
}

export function removePlayer() {
    createSpectator(player.character.getX(), player.character.getY());
    player.remove();
    player = undefined;
    if (Constants.CLEAR_MINIMAP_ON_DEATH) {
        miniMap.clear();
        map.clear();
    }
    state = States.RENDERING;
    Events.trigger('game.death');
}

export function createSpectator(x, y) {
    spectator = new Spectator(Game, x, y);
}

export function startRendering(gameInformation: Welcome) {
    Console.log('Joined Server "' + gameInformation.serverName + '"');
    const baseTexture = new PIXI.Graphics();
    layers.terrain.ground.addChild(baseTexture);
    baseTexture.beginFill(0x006030);
    baseTexture.drawCircle(0, 0, gameInformation.mapRadius);

    map = new GameMapWithBackend(Game, gameInformation.mapRadius);
    play();
    state = States.RENDERING;
    miniMap = new MiniMap(map.width, map.height);
}

function createBackground() {
    const waterRect = new PIXI.Graphics();
    layers.terrain.water.addChild(waterRect);

    waterRect.beginFill(0x287aff);
    waterRect.drawRect(0, 0, width, height);
}

Events.on('modulesLoaded', setup);
