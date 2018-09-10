'use strict';

import * as Events from '../Events';
import * as Game from '../Game';
import * as Utils from '../Utils';
import {BasicConfig as Constants} from '../../config/Basic';
import * as Console from '../Console';
import * as Develop from '../develop/_Develop';
import * as BackendConstants from './BackendConstants';
import * as SnapshotFactory from './SnapshotFactory';
import GameState from './GameState';
import ClientMessage from './ClientMessage';
import Welcome from './Welcome';
import ScoreboardMessage from './ScoreboardMessage';
import * as Chat from '../Chat';
import * as Scoreboard from '../scores/Scoreboard';
import * as DayCycle from '../DayCycle';
import * as StartScreen from '../userInterface/screens/StartScreen';
import * as EndScreen from '../userInterface/screens/EndScreen';
import * as UserInterface from '../userInterface/UserInterface';
import {BerryhunterApi} from './BerryhunterApi';
import {flatbuffers} from 'flatbuffers';


export const States = {
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    WELCOMED: 'WELCOMED',
    SPECTATING: 'SPECTATING',
    PLAYING: 'PLAYING',
    ERROR: 'ERROR',
};

let state = States.DISCONNECTED;

function setState(newState) {
    state = newState;
    // if (Utils.isDefined(SnapshotFactory.getLastGameState())) {
    // 	Console.log('Tick ' + SnapshotFactory.getLastGameState().tick + ' > Backend State: ' + state);
    // } else {
    // 	Console.log('Pre Ticks > Backend State: ' + state);
    // }
    Console.log('Backend State: ' + state);

    if (Develop.isActive()) {
        switch (state) {
            case States.DISCONNECTED:
            case States.CONNECTING:
                Develop.logWebsocketStatus(state, 'neutral');
                break;
            case States.ERROR:
                Develop.logWebsocketStatus(state, 'bad');
                break;
            default:
                Develop.logWebsocketStatus(state, 'good');
        }
    }
}

let firstGameStateReceived = false;
let firstGameStateResolve;
let firstGameStateReject;

let webSocket;
let lastMessageReceivedTime;

export function getState() {
    return state;
}

export function setup() {
    BackendConstants.setup();

    new Promise(function (resolve, reject) {
        firstGameStateResolve = resolve;
        firstGameStateReject = reject;
    }).then(function () {
        Events.triggerOneTime('firstGameStateRendered');
    });

    let url;
    if (Utils.getUrlParameter(Constants.MODE_PARAMETERS.LOCAL_SERVER)) {
        let serverPort = Utils.getUrlParameter(Constants.MODE_PARAMETERS.SERVER_PORT);
        if (serverPort) {
            url = 'ws://' + window.location.hostname + ':' + serverPort + '/game';
        } else {
            url = 'ws://' + window.location.host + '/game';
        }
    } else {
        url = Constants.BACKEND.REMOTE_URL;
    }
    setState(States.CONNECTING);
    webSocket = new WebSocket(url);

    webSocket.binaryType = 'arraybuffer';

    webSocket.onopen = function () {
        setState(States.CONNECTED);
    };

    webSocket.onerror = function () {
        setState(States.ERROR);
        if (!firstGameStateReceived) {
            firstGameStateReject();
            firstGameStateReceived = true;
        }
    };

    webSocket.onmessage = receive.bind(this);

    if (Develop.isActive()) {
        lastMessageReceivedTime = performance.now();
    }
}

/**
 *
 * @param {ClientMessage} clientMessage
 */
export function send(clientMessage) {
    if (webSocket.readyState !== WebSocket.OPEN) {
        // Websocket is not open (yet), ignore sending
        return;
    }

    webSocket.send(clientMessage.finish());
}

export function sendInputTick(inputObj) {
    if (!SnapshotFactory.hasSnapshot()) {
        // If the backend hasn't send a snapshot yet, don't send any input.
        return;
    }

    inputObj.tick = SnapshotFactory.getLastGameState().tick + 1;

    if (Develop.isActive()) {
        Develop.logClientTick(inputObj);
    }

    this.send(ClientMessage.fromInput(inputObj));
}

export function sendJoin(joinObj) {
    Events.on('gameSetup', function () {
        send(ClientMessage.fromJoin(joinObj));
    });
}

export function sendCommand(commandObj) {
    this.send(ClientMessage.fromCommand(commandObj));
}

export function sendChatMessage(chatObj) {
    this.send(ClientMessage.fromChat(chatObj));
}

export function receive(message) {
    if (!message.data) {
        if (Develop.isActive()) {
            Develop.logWebsocketStatus('Receiving empty messages', 'bad');
        }
        console.warn('Received empty message.');
        return;
    }

    let data, buffer;
    /**
     * @type {BerryhunterApi.ServerMessage}
     */
    let serverMessage;
    try {
        data = new Uint8Array(message.data);
    } catch (e) {
        if (Develop.isActive()) {
            Develop.logWebsocketStatus('Error converting message.data to Uint8Array.', 'bad');
        }
        console.error('Error converting message.data to Uint8Array.', message.data, e);
        return;
    }

    try {
        buffer = new flatbuffers.ByteBuffer(data);
    } catch (e) {
        if (Develop.isActive()) {
            Develop.logWebsocketStatus('Error creating ByteBuffer from Uint8Array.', 'bad');
        }
        console.error('Error creating ByteBuffer from Uint8Array.', data, e);
        return;
    }

    try {
        serverMessage = BerryhunterApi.ServerMessage.getRootAsServerMessage(buffer);
    } catch (e) {
        if (Develop.isActive()) {
            Develop.logWebsocketStatus('Error reading ServerMessage from ByteBuffer.', 'bad');
        }
        console.error('Error reading ServerMessage from ByteBuffer.', buffer, e);
        return;
    }

    let timeSinceLastMessage;
    if (Develop.isActive()) {
        let messageReceivedTime = performance.now();
        timeSinceLastMessage = messageReceivedTime - lastMessageReceivedTime;
        lastMessageReceivedTime = messageReceivedTime;

    }

    switch (serverMessage.bodyType()) {
        case BerryhunterApi.ServerMessageBody.Welcome:
            setState(States.WELCOMED);
            let welcome = new Welcome(serverMessage.body(new BerryhunterApi.Welcome()));
            if (Develop.isActive()) {
                Develop.logServerMessage(welcome, 'Welcome', timeSinceLastMessage);
            }
            Game.startRendering(welcome);
            break;
        case BerryhunterApi.ServerMessageBody.Accept:
            setState(States.PLAYING);
            if (Develop.isActive()) {
                Develop.logServerMessage(serverMessage.body(new BerryhunterApi.Accept()), 'Accept', timeSinceLastMessage);
            }

                StartScreen.hide();
                EndScreen.hide();
                UserInterface.show();

            break;
        case BerryhunterApi.ServerMessageBody.Obituary:
            setState(States.SPECTATING);
            if (Develop.isActive()) {
                Develop.logServerMessage(serverMessage.body(new BerryhunterApi.Obituary()), 'Obituary', timeSinceLastMessage);
            }

            Game.removePlayer();
                EndScreen.show();

            break;
        case BerryhunterApi.ServerMessageBody.EntityMessage:
            /**
             *
             * @type {BerryhunterApi.EntityMessage}
             */
            let entityMessage = serverMessage.body(new BerryhunterApi.EntityMessage());

            if (Develop.isActive()) {
                Develop.logServerMessage(entityMessage, 'EntityMessage', timeSinceLastMessage);
            }

            Chat.showMessage(entityMessage.entityId().toFloat64(), entityMessage.message());

            break;
        case BerryhunterApi.ServerMessageBody.GameState:
            let gameState = new GameState(serverMessage.body(new BerryhunterApi.GameState()));
            if (state === States.WELCOMED) {
                setState(States.SPECTATING);
                Game.createSpectator(gameState.player.x, gameState.player.y);
            }
            if (Develop.isActive()) {
                Develop.logServerTick(gameState, timeSinceLastMessage);
            }
            Events.on('gameSetup', function () {
                receiveSnapshot(SnapshotFactory.newSnapshot(state, gameState));
            });
            break;
        case BerryhunterApi.ServerMessageBody.Scoreboard:
            let scoreboardMessage = new ScoreboardMessage(serverMessage.body(new BerryhunterApi.Scoreboard()));
            Scoreboard.updateFromBackend(scoreboardMessage);
            break;
        default:
            if (Develop.isActive()) {
                Develop.logWebsocketStatus('Received unknown body type ' + serverMessage.bodyType(), 'bad');
            }
            console.warn('Received unknown body type ' + serverMessage.bodyType());
    }

}

/**
 *
 * @param {{tick: number, player: {}, entities: [], inventory: []}} snapshot
 */
export function receiveSnapshot(snapshot) {
    Game.map.newSnapshot(snapshot.entities);

    DayCycle.setTimeByTick(snapshot.tick);

    if (state === States.PLAYING) {
        if (Game.state === Game.States.PLAYING) {
            Game.player.updateFromBackend(snapshot.player);
        } else {
            Game.createPlayer(
                snapshot.player.id,
                snapshot.player.position.x,
                snapshot.player.position.y,
                snapshot.player.name);
        }

        if (Utils.isDefined(snapshot.inventory)) {
            Game.player.inventory.updateFromBackend(snapshot.inventory);
        }

        if (Develop.isActive()) {
            Game.player.character.updateAABB(snapshot.player.aabb);
        }
    }

    snapshot.entities.forEach(function (entity) {
        Game.map.addOrUpdate(entity);
    });

    if (!firstGameStateReceived) {
        firstGameStateResolve();
        firstGameStateReceived = true;
    }
}