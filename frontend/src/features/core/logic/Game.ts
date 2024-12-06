import {Application, Container, Graphics, Ticker} from 'pixi.js';

import {Backend} from '../../backend/logic/Backend';
import {GameMapWithBackend} from '../../backend/logic/GameMapWithBackend';
import {MiniMap} from '../../mini-map/MiniMap';
import * as DayCycle from '../../day-cycle/logic/DayCycle';
import {Player} from '../../player/logic/Player';
import {Spectator} from '../../player/logic/Spectator';
import {GameObject} from '../../game-objects/logic/_GameObject';
import * as HUD from '../../user-interface/HUD/logic/HUD';
import * as Chat from '../../chat/logic/Chat';
import {BasicConfig as Constants} from '../../../client-data/BasicConfig';
import {InputManager} from '../../input-system/logic/InputManager';
import {isDefined, resetFocus} from '../../common/logic/Utils';
import {WelcomeMessage} from '../../backend/logic/messages/incoming/WelcomeMessage';
import * as Console from '../../internal-tools/console/logic/Console';
import {Camera} from '../../camera/logic/Camera';
import * as Recipes from '../../items/logic/Recipes';
import * as Scoreboard from '../../scoreboard/logic/Scoreboard';
import * as GroundTextureManager from '../../ground-textures/logic/GroundTextureManager';
import {GameState, IGame, IGameLayers} from './IGame';
import {GameObjectId} from '../../common/logic/Types';
import {GraphicsConfig} from '../../../client-data/Graphics';
import {IBackend} from '../../backend/logic/IBackend';
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
import {createNamedContainer} from '../../pixi-js/logic/CustomData';
import {registerPreload} from './Preloading';


export let instance: Game;

export class Game implements IGame {

    public state = GameState.INITIALIZING;

    private application: Application;
    private readonly renderResolution: number;
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
        return this.application.canvas.width / this.renderResolution;
    }

    public get height(): number {
        return this.application.canvas.height / this.renderResolution;
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
        // Save this as it might change later on, but Pixi.js will still use the same.
        this.renderResolution = window.devicePixelRatio;

        // noinspection JSIgnoredPromiseFromCall
        registerPreload(this.application.init({
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            resolution: this.renderResolution,
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
                water: createNamedContainer('water'),
                ground: createNamedContainer('ground'),
                textures: createNamedContainer('textures'),
                resourceSpots: createNamedContainer('resourceSpots'),
            },
            placeables: {
                campfire: createNamedContainer('campfire'),
                chest: createNamedContainer('chest'),
                workbench: createNamedContainer('workbench'),
                furnace: createNamedContainer('furnace'),

                doors: createNamedContainer('doors'),
                walls: createNamedContainer('walls'),
                spikyWalls: createNamedContainer('spikyWalls'),
            },
            characters: createNamedContainer('characters'),
            mobs: {
                dodo: createNamedContainer('dodo'),
                saberToothCat: createNamedContainer('saberToothCat'),
                mammoth: createNamedContainer('mammoth'),
            },
            resources: {
                berryBush: createNamedContainer('berryBush'),
                minerals: createNamedContainer('minerals'),
                trees: createNamedContainer('trees'),
            },
            characterAdditions: {
                craftProgress: createNamedContainer('craftProgress'),
                chatMessages: createNamedContainer('chatMessages'),
            },
            overlays: {
                vitalSignIndicators: createNamedContainer('vitalSignIndicators'),
            },
            // UI Overlay is the highest layer, but not managed with pixi.js
        };

        // Terrain Background
        this.stage.addChild(this.layers.terrain.water);

        this.cameraGroup = createNamedContainer('cameraGroup');
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


        HUD.setup(this);

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
        DayCycle.setup(gameInformation.totalDayCycleTicks, gameInformation.dayTimeTicks, 
            [
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
            ]
        );
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
