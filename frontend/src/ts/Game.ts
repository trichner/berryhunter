'use strict';

import * as PIXI from 'pixi.js';
import * as Preloading from './Preloading';
import * as MapEditor from './mapEditor/_MapEditor';
import * as Backend from './backend/Backend';
import GameMapWithBackend from './backend/GameMapWithBackend';
import * as Develop from './develop/_Develop';
import * as MiniMap from './MiniMap';
import * as DayCycle from './DayCycle';
import * as Player from './Player';
import * as Spectator from './Spectator';
import GameObject from './gameObjects/_GameObject';
import * as UserInterface from './userInterface/UserInterface';
import * as Chat from './Chat';
import * as NamedGroup from './NamedGroup';
import {BasicConfig as Constants} from '../config/Basic';
import InputManager from './input/InputManager';
import * as Events from './Events';
import * as GroundTexturePanel from './groundTextures/_Panel';
import {isDefined} from './Utils';
import Welcome from "./backend/Welcome";
import * as Console from './Console';


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
        VitalSigns.setup(layers.overlays.vitalSignIndicators);
        Recipes.setup();
        Scoreboard.setup();
        GroundTextureManager.setup();
    }));


    domElement = renderer.view;
    GameObject.setup();
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
    if (MapEditor.isActive()) {
        domElement.addEventListener('blur', function () {
            pause();
        });
        domElement.addEventListener('focus', function () {
            if (started) {
                play();
            }
        });
    }

    UserInterface.setup();

    /*
     * Initializing modules that require an initialized UI
     */

    Chat.setup();
    GroundTexturePanel.setup();

    if (Develop.isActive()) {
        Develop.afterSetup();
    }

    if (MapEditor.isActive()) {
        MapEditor.afterSetup();
    }

    Promise.all(setupPromises).then(function () {
        Events.triggerOneTime('gameSetup');
    });
}


export function relativeWidth(value) {
    return value * width / 100;
}

export function relativeHeight(value) {
    return value * height / 100;
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
    player = new Player(id, x, y, name);
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
    spectator = new Spectator(x, y);
}

export function startRendering(gameInformation: Welcome) {
    Console.log('Joined Server "' + gameInformation.serverName + '"');
    const baseTexture = new PIXI.Graphics();
    layers.terrain.ground.addChild(baseTexture);
    baseTexture.beginFill(0x006030);
    baseTexture.drawCircle(0, 0, gameInformation.mapRadius);

    map = new GameMapWithBackend(gameInformation.mapRadius);
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