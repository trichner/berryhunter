'use strict';

import * as PIXI from 'pixi.js';
import {Backend} from "./backend/Backend";
import {GameMapWithBackend} from './backend/GameMapWithBackend';
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
import {isDefined} from './Utils';
import {WelcomeMessage} from "./backend/messages/incoming/WelcomeMessage";
import * as Console from './Console';
import {Camera} from './Camera';
import {VitalSigns} from './VitalSigns';
import * as Recipes from './items/Recipes';
import * as Scoreboard from './scores/Scoreboard';
import * as GroundTextureManager from './groundTextures/GroundTextureManager';
import {GameState, IGame} from "./interfaces/IGame";
import {GameObjectId} from "./interfaces/Types";
import {GraphicsConfig} from "../config/Graphics";
import {IBackend} from "./interfaces/IBackend";
import {Develop} from "./develop/_Develop";
import {
    BackendValidTokenEvent,
    BeforeDeathEvent,
    GameLateSetupEvent,
    GamePlayingEvent,
    GameSetupEvent,
    ModulesLoadedEvent,
    PrerenderEvent
} from "./Events";
import {LargeMap} from "./LargeMap";


export let instance: Game;

export class Game implements IGame {

    public state = GameState.INITIALIZING;

    public renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    public width: number;
    public height: number;
    public centerX: number;
    public centerY: number;
    public layers;
    public stage: PIXI.Container;
    public cameraGroup: PIXI.Container;
    public largeMap: LargeMap = null;

    public map: GameMapWithBackend = null;
    public miniMap: MiniMap = null;

    public domElement: HTMLCanvasElement;
    public input: InputManager;

    // TODO merge with GameState?
    public started: boolean;
    public paused: boolean;
    public playing: boolean;

    public timeDelta: number;
    private _lastFrame: number;

    public spectator: Spectator;
    public player: Player;
    private backend: IBackend;

    setup(): void {
        let setupPromises = [];

        // Setup backend first, as this will take some time to connect.
        this.backend = new Backend();
        this.backend.setup(this);
        GameSetupEvent.trigger(this);

        this.renderer = PIXI.autoDetectRenderer({
            antialias: true,
            backgroundColor: 0x006030
        });

        // Fullscreen
        this.renderer.view.style.position = "absolute";
        this.renderer.view.style.display = "block";
        this.renderer.autoResize = true;
        this.resizeToWindow();

        //Add the canvas to the HTML document
        document.body.insertBefore(
            this.renderer.view,
            document.body.firstChild);

        this.width = this.renderer.width;
        this.height = this.renderer.height;

        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        /**
         * Ordered by z-index
         */
        this.layers = {
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

        this.stage = new PIXI.Container();

        // Terrain Background
        this.stage.addChild(this.layers.terrain.water);

        this.cameraGroup = new NamedGroup('cameraGroup');
        this.stage.addChild(this.cameraGroup);

        // Terrain Textures moving with the camera
        this.cameraGroup.addChild(
            this.layers.terrain.ground,
            this.layers.terrain.textures,
            this.layers.terrain.resourceSpots
        );

        // Lower Placeables
        this.cameraGroup.addChild(
            this.layers.placeables.campfire,
            this.layers.placeables.chest,
            this.layers.placeables.workbench,
            this.layers.placeables.furnace,
            this.layers.resources.berryBush
        );

        // Characters
        this.cameraGroup.addChild(this.layers.characters);

        // Mobs
        this.cameraGroup.addChild(
            this.layers.mobs.dodo,
            this.layers.mobs.saberToothCat,
            this.layers.mobs.mammoth
        );

        // Higher Placeables
        this.cameraGroup.addChild(
            this.layers.placeables.doors,
            this.layers.placeables.walls,
            this.layers.placeables.spikyWalls
        );

        // Resources
        this.cameraGroup.addChild(
            this.layers.resources.minerals,
            this.layers.resources.trees
        );

        // Character Additions
        this.cameraGroup.addChild(
            this.layers.characterAdditions.craftProgress,
            this.layers.characterAdditions.chatMessages,
        );

        // Vital Sign Indicators on top of everything
        // And not part of the night filter container
        this.stage.addChild(this.layers.overlays.vitalSignIndicators);

        this.createBackground();

        Camera.setup(this);
        VitalSigns.setup(this, this.layers.overlays.vitalSignIndicators);
        Recipes.setup(this);
        Scoreboard.setup();
        GroundTextureManager.setup(this);

        this.domElement = this.renderer.view;
        GameObject.setup();
        DayCycle.setup(this.domElement, [
            this.layers.terrain.water,
            this.layers.terrain.ground,
            this.layers.terrain.textures,
            this.layers.terrain.resourceSpots,
            this.layers.placeables.chest,
            this.layers.placeables.workbench,
            this.layers.resources.berryBush,
            this.layers.characters,
            this.layers.mobs.dodo,
            this.layers.mobs.saberToothCat,
            this.layers.mobs.mammoth,
            this.layers.placeables.doors,
            this.layers.placeables.walls,
            this.layers.placeables.spikyWalls,
            this.layers.resources.minerals,
            this.layers.resources.trees,
        ]);

        this.input = new InputManager({
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
        this.input.boot();

        // Disable context menu on right click to use the right click ingame
        document.body.addEventListener('contextmenu', (event) => {
            if (event.target === this.domElement || this.domElement.contains(event.target as Node)) {
                event.preventDefault();
            }
        });


        UserInterface.setup(this);

        /*
         * Initializing modules that require an initialized UI
         */

        Chat.setup(this, Backend);

        if (Develop.isActive()) {
            Develop.get().afterSetup(this);
        }

        /*
         * https://trello.com/c/aq5lqJB7/289-schutz-gegen-versehentliches-verlassen-des-spiels
         */
        // TODO move in setup
        window.onbeforeunload = (event) => {
            // Only ask for confirmation if the user is in-game
            if (this.state !== GameState.PLAYING) {
                return;
            }

            // Don't bother developers with confirmations
            if (developEnabled) {
                return;
            }

            let dialogText = 'Do you want to leave this game? You\'re progress will be lost.';
            event.preventDefault();
            event.returnValue = dialogText;
            return dialogText;
        };

        Promise.all(setupPromises).then(() => {
            GameLateSetupEvent.trigger(this);
        });
    }

    resizeToWindow(): void {
        this.renderer.resize(window.innerWidth, window.innerHeight);
    }

    private loop(now): void {
        if (this.paused) {
            return;
        }

        requestAnimationFrame(this.loop.bind(this));

        this.timeDelta = this.timeSinceLastFrame(now);

        this.render();

        this._lastFrame = now;
    }

    private timeSinceLastFrame(now): number {
        return now - this._lastFrame;
    }

    play(): void {
        this.playing = true;
        this.paused = false;
        this._lastFrame = performance.now();
        this.loop(this._lastFrame);
    }

    pause(): void {
        this.playing = false;
        this.paused = true;
    }

    private render(): void {
        PrerenderEvent.trigger(this.timeDelta);
        this.renderer.render(this.stage);
    }

    /**
     * Creating a player starts implicitly the game
     */
    createPlayer(id: GameObjectId, x: number, y: number, name: string): void {
        if (isDefined(this.spectator)) {
            this.spectator.remove();
            this.spectator = undefined;
        }

        /**
         * @type Player
         */
        this.player = new Player(id, x, y, name, this.miniMap, this.largeMap);
        this.player.init();
        this.state = GameState.PLAYING;
        GamePlayingEvent.trigger(this);
    }

    removePlayer(): void {
        BeforeDeathEvent.trigger(this);
        this.createSpectator(this.player.character.getX(), this.player.character.getY());
        this.player.remove();
        this.player = undefined;
        if (Constants.CLEAR_MINIMAP_ON_DEATH) {
            this.miniMap.clear();
            this.largeMap.clear();
            this.map.clear();
        }
        this.state = GameState.RENDERING;
    }

    createSpectator(x: number, y: number): void {
        this.spectator = new Spectator(this, x, y);
    }

    startRendering(gameInformation: WelcomeMessage): void {
        Console.log('Joined Server "' + gameInformation.serverName + '"');
        const baseTexture = new PIXI.Graphics();
        this.layers.terrain.ground.addChild(baseTexture);
        baseTexture.beginFill(GraphicsConfig.landColor);
        baseTexture.drawCircle(0, 0, gameInformation.mapRadius);

        this.map = new GameMapWithBackend(this, gameInformation.mapRadius);
        this.play();
        this.state = GameState.RENDERING;
        this.miniMap = new MiniMap(this.map.width, this.map.height);
        this.largeMap = new LargeMap(this.map.width, this.map.height);
    }

    private createBackground() {
        const waterRect = new PIXI.Graphics();
        this.layers.terrain.water.addChild(waterRect);

        waterRect.beginFill(GraphicsConfig.waterColor);
        waterRect.drawRect(0, 0, this.width, this.height);
    }
}

instance = new Game();

ModulesLoadedEvent.subscribe(instance.setup, instance);

/*
 * Make sure the body can be focused.
 */
document.body.tabIndex = 0;


let developEnabled = false;
BackendValidTokenEvent.subscribe( function () {
    developEnabled = true;
});
