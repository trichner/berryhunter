import * as PIXI from "pixi.js";
import {EntityManager} from "../../backend/logic/EntityManager";
import {MiniMap} from "../../mini-map/logic/MiniMap";
import {Spectator} from "../../player/logic/Spectator";
import {Player} from "../../player/logic/Player";
import {InputManager} from "../../input-system/logic/InputManager";
import {WelcomeMessage} from "../../backend/logic/messages/incoming/WelcomeMessage";
import {gameObjectId} from "../../common/logic/Types";
import {Container} from 'pixi.js';

export enum GameState {
    INITIALIZING,
    RENDERING,
    PLAYING
}

export interface IGameLayers {
    terrain: Record<string, Container>,
    placeables: Record<string, Container>,
    characters: Container,
    mobs: Record<string, Container>,
    resources: Record<string, Container>,
    bossMobs: Container,
    characterAdditions: Record<string, Container>,
    overlays: Record<string, Container>,
}

export interface IGame {
    readonly state: GameState;

    readonly width: number;
    readonly height: number;
    readonly centerX: number;
    readonly centerY: number;

    readonly layers: IGameLayers;
    readonly cameraGroup: PIXI.Container;

    readonly map: EntityManager;
    readonly miniMap: MiniMap;

    readonly domElement: HTMLCanvasElement;
    readonly inputManager: InputManager;

    readonly started: boolean;
    readonly paused: boolean;
    readonly playing: boolean;

    readonly timeDelta: number;

    readonly spectator: Spectator;
    readonly player: Player;

    setup(): void;

    play(): void;

    pause(): void;

    createPlayer(id: gameObjectId, x: number, y: number, name: string): void;

    removePlayer(): void;

    createSpectator(x: number, y: number): void;

    startRendering(gameInformation: WelcomeMessage): void;
}
