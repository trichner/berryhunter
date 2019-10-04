import {BackendState} from "../backend/Backend";
import {IGame} from "./IGame";

export interface IBackend {
    readonly webSocket: WebSocket;

    setup(game: IGame): void;

    getState(): BackendState;
}