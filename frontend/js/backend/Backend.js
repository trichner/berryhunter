'use strict';

define([
	'Game',
	'Utils',
	'Constants',
	'Console',
	'Develop',
	'backend/BackendConstants',
	'backend/SnapshotFactory',
	'backend/GameState',
	'backend/ClientMessage',
	'backend/Welcome',
	'backend/ScoreboardMessage',
	'Chat',
    'Scoreboard',
	'DayCycle',
	'vendor/flatbuffers',
	'schema_common',
	'schema_server',
	'schema_client',
], function (Game, Utils, Constants, Console, Develop, BackendConstants, SnapshotFactory, GameState,
             ClientMessage, Welcome, ScoreboardMessage, Chat, Scoreboard, DayCycle) {

	const States = {
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

	//noinspection UnnecessaryLocalVariableJS
	const Backend = {
		States: States,

		getState: function () {
			return state;
		},

		setup: function () {
			BackendConstants.setup();

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
			this.webSocket = new WebSocket(url);

			this.webSocket.binaryType = 'arraybuffer';

			this.webSocket.onopen = function () {
				setState(States.CONNECTED);
			};

			this.webSocket.onerror = function () {
				setState(States.ERROR);
			};

			this.webSocket.onmessage = this.receive.bind(this);

			if (Develop.isActive()) {
				this.lastMessageReceivedTime = performance.now();
			}
		},

		/**
		 *
		 * @param {ClientMessage} clientMessage
		 */
		send: function (clientMessage) {
			if (this.webSocket.readyState !== WebSocket.OPEN) {
				// Websocket is not open (yet), ignore sending
				return;
			}

			this.webSocket.send(clientMessage.finish());
		},

		sendInputTick: function (inputObj) {
			if (!SnapshotFactory.hasSnapshot()) {
				// If the backend hasn't send a snapshot yet, don't send any input.
				return;
			}

			inputObj.tick = SnapshotFactory.getLastGameState().tick + 1;

			if (Develop.isActive()) {
				Develop.logClientTick(inputObj);
			}

			this.send(ClientMessage.fromInput(inputObj));
		},

		sendJoin: function (joinObj) {
			this.send(ClientMessage.fromJoin(joinObj));
		},

		sendCommand: function (commandObj) {
			this.send(ClientMessage.fromCommand(commandObj));
		},

		sendChatMessage: function (chatObj) {
			this.send(ClientMessage.fromChat(chatObj));
		},

		receive: function (message) {
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
				timeSinceLastMessage = messageReceivedTime - this.lastMessageReceivedTime;
				this.lastMessageReceivedTime = messageReceivedTime;

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

					require([
						'StartScreen',
						'EndScreen',
						'userInterface/UserInterface',
					], function (StartScreen, EndScreen, UserInterface) {
						StartScreen.hide();
						EndScreen.hide();
						UserInterface.show();
					});

					break;
				case BerryhunterApi.ServerMessageBody.Obituary:
					if (Game.godMode) {
						console.info('Auto rejoin');
						Backend.sendJoin({
							playerName: Game.player.character.name
						});

						let position = Game.player.character.getPosition();
						if (Utils.getUrlParameter('token')) {
							Backend.sendCommand({
								command: ['Warp ',
									position.x.toFixed(0),
									' ',
									position.y.toFixed(0)].join(''),
								token: Utils.getUrlParameter('token'),
							});

							Game.player.character.say('GOD MODE - Respawn');

						} else {
							Game.player.character.say('GOD MODE - Respawn.');
							Game.player.character.say('WARNING: Missing token, can\'t reset old position.');
						}

						break;
					}

					setState(States.SPECTATING);
					if (Develop.isActive()) {
						Develop.logServerMessage(serverMessage.body(new BerryhunterApi.Obituary()), 'Obituary', timeSinceLastMessage);
					}

					Game.removePlayer();
					require(['EndScreen'], function (EndScreen) {
						EndScreen.show();
					});

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
					this.receiveSnapshot(SnapshotFactory.newSnapshot(state, gameState));
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

		},

		/**
		 *
		 * @param {{tick: number, player: {}, entities: [], inventory: []}} snapshot
		 */
		receiveSnapshot: function (snapshot) {
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
		},


	};

	return Backend;
});