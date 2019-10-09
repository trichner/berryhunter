import * as PIXI from "pixi.js";
import {GameMapWithBackend} from "../backend/GameMapWithBackend";
import {MiniMap} from "../MiniMap";
import {Spectator} from "../Spectator";
import {Player} from "../Player";
import {InputManager} from "../input/InputManager";
import {WelcomeMessage} from "../backend/messages/incoming/WelcomeMessage";
import {GameObjectId} from "./Types";
import {LargeMap} from "../LargeMap";

export enum GameState {
    INITIALIZING,
    RENDERING,
    PLAYING
}

export interface IGame {
    state: GameState;

    width: number;
    height: number;
    centerX: number;
    centerY: number;
    layers;
    stage: PIXI.Container;
    cameraGroup: PIXI.Container;

    map: GameMapWithBackend;
    miniMap: MiniMap;
    largeMap: LargeMap;

    domElement: HTMLCanvasElement;
    input: InputManager;

    // TODO merge with GameState?
    started: boolean;
    paused: boolean;
    playing: boolean;

    timeDelta: number;

    spectator: Spectator;
    player: Player;

    setup(): void;

    resizeToWindow(): void;

    play(): void;

    pause(): void;

    createPlayer(id: GameObjectId, x: number, y: number, name: string): void;

    removePlayer(): void;

    createSpectator(x: number, y: number): void;

    startRendering(gameInformation: WelcomeMessage): void;
}
