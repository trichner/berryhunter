import * as Utils from '../Utils';
import * as Console from '../Console';
import * as BackendConstants from './BackendConstants';
import * as SnapshotFactory from './SnapshotFactory';
import {Snapshot} from './SnapshotFactory';
import {GameStateMessage} from './messages/incoming/GameStateMessage';
import {WelcomeMessage} from './messages/incoming/WelcomeMessage';
import {ScoreboardMessage} from './messages/incoming/ScoreboardMessage';
import * as Chat from '../Chat';
import * as Scoreboard from '../scores/Scoreboard';
import * as DayCycle from '../DayCycle';
import * as StartScreen from '../userInterface/screens/StartScreen';
import * as EndScreen from '../userInterface/screens/EndScreen';
import * as UserInterface from '../userInterface/UserInterface';
import {BerryhunterApi} from './BerryhunterApi';
import {flatbuffers} from 'flatbuffers';
import * as Urls from './Urls';
import {GameState, IGame} from "../interfaces/IGame";
import {BackendState, IBackend} from "../interfaces/IBackend";
import {Develop} from "../develop/_Develop";
import {
    BackendConnectionFailureEvent,
    BackendSetupEvent,
    BackendStateChangedEvent,
    BackendValidTokenEvent,
    FirstGameStateHandledEvent,
    GameLateSetupEvent
} from "../Events";

export class Backend implements IBackend {

    game: IGame = null;

    state: BackendState = BackendState.DISCONNECTED;

    firstGameStateReceived: boolean = false;
    firstGameStateResolve: () => void;
    firstGameStateReject: () => void;

    webSocket: WebSocket;
    lastMessageReceivedTime: number;

    public setup(game: IGame): void {
        this.game = game;

        BackendConstants.setup();

        new Promise<void>((resolve, reject) => {
            this.firstGameStateResolve = resolve;
            this.firstGameStateReject = reject;
        }).then(() => {
            FirstGameStateHandledEvent.trigger();
        }).catch(() => {
            BackendConnectionFailureEvent.trigger();
        });

        this.setState(BackendState.CONNECTING);
        this.webSocket = new WebSocket(Urls.gameServer);
        this.webSocket.binaryType = 'arraybuffer';
        this.webSocket.onopen = () => {
            this.setState(BackendState.CONNECTED);
        };
        this.webSocket.onerror = () => {
            this.setState(BackendState.ERROR);
            if (!this.firstGameStateReceived) {
                this.firstGameStateReject();
                this.firstGameStateReceived = true;
            }
        };

        this.webSocket.onmessage = this.receive.bind(this);

        if (Develop.isActive()) {
            this.lastMessageReceivedTime = performance.now();
        }

        BackendSetupEvent.trigger(this);
    }

    public getState(): BackendState {
        return this.state;
    }

    setState(newState: BackendState) {
        let oldState = this.state;
        this.state = newState;
        Console.log('Backend State: ' + this.state);

        if (Develop.isActive()) {
            switch (this.state) {
                case BackendState.DISCONNECTED:
                case BackendState.CONNECTING:
                    Develop.get().logWebsocketStatus(this.state, 'neutral');
                    break;
                case BackendState.ERROR:
                    Develop.get().logWebsocketStatus(this.state, 'bad');
                    break;
                default:
                    Develop.get().logWebsocketStatus(this.state, 'good');
            }
        }

        BackendStateChangedEvent.trigger({
            oldState: oldState,
            newState: newState
        });
    }

    private receive(message: MessageEvent): void {
        if (!message.data) {
            if (Develop.isActive()) {
                Develop.get().logWebsocketStatus('Receiving empty messages', 'bad');
            }
            console.warn('Received empty message.');
            return;
        }

        let data: Uint8Array;
        let buffer: flatbuffers.ByteBuffer;
        let serverMessage: BerryhunterApi.ServerMessage;
        try {
            data = new Uint8Array(message.data);
        } catch (e) {
            if (Develop.isActive()) {
                Develop.get().logWebsocketStatus('Error converting message.data to Uint8Array.', 'bad');
            }
            console.error('Error converting message.data to Uint8Array.', message.data, e);
            return;
        }

        try {
            buffer = new flatbuffers.ByteBuffer(data);
        } catch (e) {
            if (Develop.isActive()) {
                Develop.get().logWebsocketStatus('Error creating ByteBuffer from Uint8Array.', 'bad');
            }
            console.error('Error creating ByteBuffer from Uint8Array.', data, e);
            return;
        }

        try {
            serverMessage = BerryhunterApi.ServerMessage.getRootAsServerMessage(buffer);
        } catch (e) {
            if (Develop.isActive()) {
                Develop.get().logWebsocketStatus('Error reading ServerMessage from ByteBuffer.', 'bad');
            }
            console.error('Error reading ServerMessage from ByteBuffer.', buffer, e);
            return;
        }

        let timeSinceLastMessage;
        if (Develop.isActive()) {
            let messageReceivedTime = performance.now();
            timeSinceLastMessage = messageReceivedTime - this.lastMessageReceivedTime;
            this.lastMessageReceivedTime = messageReceivedTime;
        }

        switch (serverMessage.bodyType()) {
            case BerryhunterApi.ServerMessageBody.Welcome:
                this.setState(BackendState.WELCOMED);
                let welcome = new WelcomeMessage(serverMessage.body(new BerryhunterApi.Welcome()));
                if (Develop.isActive()) {
                    Develop.get().logServerMessage(welcome, 'Welcome', timeSinceLastMessage);
                }
                this.game.startRendering(welcome);
                break;
            case BerryhunterApi.ServerMessageBody.Accept:
                this.setState(BackendState.PLAYING);
                if (Develop.isActive()) {
                    Develop.get().logServerMessage(serverMessage.body(new BerryhunterApi.Accept()), 'Accept', timeSinceLastMessage);
                }

                StartScreen.hide();
                EndScreen.hide();
                UserInterface.show();

                break;
            case BerryhunterApi.ServerMessageBody.Obituary:
                this.setState(BackendState.SPECTATING);
                if (Develop.isActive()) {
                    Develop.get().logServerMessage(serverMessage.body(new BerryhunterApi.Obituary()), 'Obituary', timeSinceLastMessage);
                }

                this.game.removePlayer();
                EndScreen.show();

                break;
            case BerryhunterApi.ServerMessageBody.EntityMessage:
                /**
                 *
                 * @type {BerryhunterApi.}
                 */
                let entityMessage: BerryhunterApi.EntityMessage = serverMessage.body(new BerryhunterApi.EntityMessage());

                if (Develop.isActive()) {
                    Develop.get().logServerMessage(entityMessage, 'EntityMessage', timeSinceLastMessage);
                }

                Chat.showMessage(entityMessage.entityId().toFloat64(), entityMessage.message());

                break;
            case BerryhunterApi.ServerMessageBody.GameState:
                let gameState = new GameStateMessage(serverMessage.body(new BerryhunterApi.GameState()));
                if (this.state === BackendState.WELCOMED) {
                    this.setState(BackendState.SPECTATING);
                    this.game.createSpectator(gameState.player.x, gameState.player.y);
                }
                if (Develop.isActive()) {
                    Develop.get().logServerTick(gameState, timeSinceLastMessage);
                }
                GameLateSetupEvent.subscribe(() => {
                    this.receiveSnapshot(SnapshotFactory.newSnapshot(this.state, gameState));
                });
                break;
            case BerryhunterApi.ServerMessageBody.Scoreboard:
                let scoreboardMessage = new ScoreboardMessage(serverMessage.body(new BerryhunterApi.Scoreboard()));
                Scoreboard.updateFromBackend(scoreboardMessage);
                break;
            case BerryhunterApi.ServerMessageBody.Pong:
                BackendValidTokenEvent.trigger(this);
                break;
            default:
                if (Develop.isActive()) {
                    Develop.get().logWebsocketStatus('Received unknown body type ' + serverMessage.bodyType(), 'bad');
                }
                console.warn('Received unknown body type ' + serverMessage.bodyType());
        }

    }

    public receiveSnapshot(snapshot: Snapshot) {
        this.game.map.newSnapshot(snapshot.entities);

        DayCycle.setTimeByTick(snapshot.tick);

        if (this.state === BackendState.PLAYING) {
            if (this.game.state === GameState.PLAYING) {
                this.game.player.updateFromBackend(snapshot.player);
            } else {
                this.game.createPlayer(
                    snapshot.player.id,
                    snapshot.player.position.x,
                    snapshot.player.position.y,
                    snapshot.player.name);
            }

            if (Utils.isDefined(snapshot.inventory)) {
                this.game.player.inventory.updateFromBackend(snapshot.inventory);
            }

            if (Develop.isActive()) {
                this.game.player.character['updateAABB'](snapshot.player.aabb);
            }
        }

        snapshot.entities.forEach((entity) => {
            this.game.map.addOrUpdate(entity);
        });

        if (!this.firstGameStateReceived) {
            this.firstGameStateResolve();
            this.firstGameStateReceived = true;
        }
    }
}
