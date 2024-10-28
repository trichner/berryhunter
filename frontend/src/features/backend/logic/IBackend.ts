import {IGame} from "../../../old-structure/interfaces/IGame";

export enum BackendState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    WELCOMED = 'WELCOMED',
    SPECTATING = 'SPECTATING',
    PLAYING = 'PLAYING',
    ERROR = 'ERROR',
}

export interface IBackend {
    readonly webSocket: WebSocket;

    setup(game: IGame): void;

    getState(): BackendState;
}
