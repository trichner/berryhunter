import {Application, Container, Graphics, Ticker} from 'pixi.js';

import {Backend} from './backend/Backend';
import {GameMapWithBackend} from './backend/GameMapWithBackend';
import {MiniMap} from './MiniMap';
import * as DayCycle from './DayCycle';
import {Player} from './Player';
import {Spectator} from './Spectator';
import {GameObject} from './gameObjects/_GameObject';
import * as UserInterface from './userInterface/UserInterface';
import * as Chat from './Chat';
import {BasicConfig as Constants} from '../game-data/BasicConfig';
import {InputManager} from './input/InputManager';
import {isDefined, resetFocus} from './Utils';
import {WelcomeMessage} from './backend/messages/incoming/WelcomeMessage';
import * as Console from './Console';
import {Camera} from './Camera';
import * as Recipes from './items/Recipes';
import * as Scoreboard from './scores/Scoreboard';
import * as GroundTextureManager from './groundTextures/GroundTextureManager';
import {GameState, IGame, IGameLayers} from './interfaces/IGame';
import {GameObjectId} from './interfaces/Types';
import {GraphicsConfig} from '../game-data/Graphics';
import {IBackend} from './interfaces/IBackend';
import {
    BackendValidTokenEvent,
    BeforeDeathEvent,
    GameLateSetupEvent,
    GamePlayingEvent,
    GameSetupEvent,
    ModulesLoadedEvent,
    PrerenderEvent,
    UserInteraceDomReadyEvent,
} from './Events';
import {createNameContainer} from './CustomData';
import {registerPreload} from './Preloading';


export let instance: Game;

export class Game implements IGame {

    public state = GameState.INITIALIZING;

    private application: Application;
    public layers: IGameLayers;
    public cameraGroup: Container;

    public map: GameMapWithBackend = null;
    public miniMap: MiniMap = null;

    public inputManager: InputManager;

    // TODO merge with GameState?
    public started: boolean;
    public paused: boolean;
    public playing: boolean;

    public timeDelta: number;

    public spectator: Spectator;
    public player: Player;
    private backend: IBackend;

    public get width(): number {
        return this.application.canvas.width;
    }

    public get height(): number {
        return this.application.canvas.height;
    }

    public get centerX(): number {
        return this.width / 2;
    }

    public get centerY(): number {
        return this.height / 2;
    }

    public get domElement(): HTMLCanvasElement {
        return this.application.canvas;
    }

    private get stage(): Container {
        return this.application.stage;
    }

    constructor() {
        this.application = new Application();

        // noinspection JSIgnoredPromiseFromCall
        registerPreload(this.application.init({
            resizeTo: window,
            antialias: true,
        }));
    }

    setup(): void {
        let setupPromises = [];

        // Setup backend first, as this will take some time to connect.
        this.backend = new Backend();
        this.backend.setup(this);
        GameSetupEvent.trigger(this);

        //Add the canvas to the HTML document
        document.body.prepend(this.domElement);

        /**
         * Ordered by z-index
         */
        this.layers = {
            terrain: {
                water: createNameContainer('water'),
                ground: createNameContainer('ground'),
                textures: createNameContainer('textures'),
                resourceSpots: createNameContainer('resourceSpots'),
            },
            placeables: {
                campfire: createNameContainer('campfire'),
                chest: createNameContainer('chest'),
                workbench: createNameContainer('workbench'),
                furnace: createNameContainer('furnace'),

                doors: createNameContainer('doors'),
                walls: createNameContainer('walls'),
                spikyWalls: createNameContainer('spikyWalls'),
            },
            characters: createNameContainer('characters'),
            mobs: {
                dodo: createNameContainer('dodo'),
                saberToothCat: createNameContainer('saberToothCat'),
                mammoth: createNameContainer('mammoth'),
            },
            resources: {
                berryBush: createNameContainer('berryBush'),
                minerals: createNameContainer('minerals'),
                trees: createNameContainer('trees'),
            },
            characterAdditions: {
                craftProgress: createNameContainer('craftProgress'),
                chatMessages: createNameContainer('chatMessages'),
            },
            overlays: {
                vitalSignIndicators: createNameContainer('vitalSignIndicators'),
            },
            // UI Overlay is the highest layer, but not managed with pixi.js
        };

        // Terrain Background
        this.stage.addChild(this.layers.terrain.water);

        this.cameraGroup = createNameContainer('cameraGroup');
        this.stage.addChild(this.cameraGroup);

        // Terrain Textures moving with the camera
        this.cameraGroup.addChild(
            this.layers.terrain.ground,
            this.layers.terrain.textures,
            this.layers.terrain.resourceSpots,
        );

        // Lower Placeables
        this.cameraGroup.addChild(
            this.layers.placeables.campfire,
            this.layers.placeables.chest,
            this.layers.placeables.workbench,
            this.layers.placeables.furnace,
            this.layers.resources.berryBush,
        );

        // Characters
        this.cameraGroup.addChild(this.layers.characters);

        // Mobs
        this.cameraGroup.addChild(
            this.layers.mobs.dodo,
            this.layers.mobs.saberToothCat,
            this.layers.mobs.mammoth,
        );

        // Higher Placeables
        this.cameraGroup.addChild(
            this.layers.placeables.doors,
            this.layers.placeables.walls,
            this.layers.placeables.spikyWalls,
        );

        // Resources
        this.cameraGroup.addChild(
            this.layers.resources.minerals,
            this.layers.resources.trees,
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
        Recipes.setup(this);
        Scoreboard.setup();
        GroundTextureManager.setup(this);

        GameObject.setup();
        DayCycle.setup([
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

        this.inputManager = new InputManager({
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
        this.inputManager.boot();

        // Disable context menu on right click to use the right click in-game
        document.body.addEventListener('contextmenu', (event) => {
            if (event.target === this.domElement || this.domElement.contains(event.target as Node)) {
                event.preventDefault();
            }
        });

        // Not really sure why, but clicking through the game (and thus into the body) does not restore the focus on the game
        // but this would be required to interact with overlay panels such as Develop or Settings
        document.body.addEventListener('click', (event) => {
            resetFocus();
        });


        UserInterface.setup(this);

        /*
         * Initializing modules that require an initialized UI
         */

        Chat.setup(this, Backend);

        /*
         * https://trello.com/c/aq5lqJB7/289-schutz-gegen-versehentliches-verlassen-des-spiels
         */
        window.onbeforeunload = (event: BeforeUnloadEvent) => {
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
            // noinspection JSDeprecatedSymbols
            event.returnValue = dialogText;
            return dialogText;
        };

        Promise.all(setupPromises).then(() => {
            GameLateSetupEvent.trigger(this);
        });
    }

    private loop(ticker: Ticker): void {
        if (this.paused) {
            return;
        }

        this.timeDelta = ticker.deltaMS;
        PrerenderEvent.trigger(this.timeDelta);
    }

    play(): void {
        this.playing = true;
        this.paused = false;
        this.application.start();
        this.application.ticker.add(this.loop, this);
    }

    pause(): void {
        this.playing = false;
        this.paused = true;
        this.application.stop();
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
        this.player = new Player(id, x, y, name, this.miniMap);
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
            this.map.clear();
        }
        this.state = GameState.RENDERING;
    }

    createSpectator(x: number, y: number): void {
        this.spectator = new Spectator(this, x, y);
    }

    startRendering(gameInformation: WelcomeMessage): void {
        Console.log('Joined Server "' + gameInformation.serverName + '"');
        this.layers.terrain.ground.addChild(new Graphics()
            .circle(0, 0, gameInformation.mapRadius)
            .fill(GraphicsConfig.shallowWaterColor));
        this.layers.terrain.ground.addChild(new Graphics()
            .circle(0, 0, gameInformation.mapRadius - 240) // deduct a bit of radius to allow movement in "shallow" water
            .fill(GraphicsConfig.landColor));

        this.map = new GameMapWithBackend(this, gameInformation.mapRadius);
        this.play();
        this.state = GameState.RENDERING;
        this.miniMap.setup(this.map.width, this.map.height);
    }

    private createBackground() {
        this.application.renderer.background.color = GraphicsConfig.deepWaterColor;
        const waterRect = new Graphics()
            .rect(0, 0, this.width, this.height)
            .fill(GraphicsConfig.deepWaterColor);
        this.layers.terrain.water.addChild(waterRect);
    }
}

instance = new Game();

ModulesLoadedEvent.subscribe(instance.setup, instance);
UserInteraceDomReadyEvent.subscribe(() => {
    instance.miniMap = new MiniMap();
});
/*
 * Make sure the body can be focused.
 */
document.body.tabIndex = 0;


let developEnabled = false;
BackendValidTokenEvent.subscribe(function () {
    developEnabled = true;
});
