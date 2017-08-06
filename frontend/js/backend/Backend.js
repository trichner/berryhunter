"use strict";

define([
	'Game',
	'Utils',
	'Constants',
	'Develop',
	'backend/BackendConstants',
	'backend/SnapshotFactory',
	'backend/GameState',
	'vendor/flatbuffers',
	'schema_common',
	'schema_server',
	'schema_client',
], function (Game, Utils, Constants, Develop, BackendConstants, SnapshotFactory, GameState) {

	//noinspection UnnecessaryLocalVariableJS
	const Backend = {
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
			// url += '?name'
			this.webSocket = new WebSocket(url);

			this.webSocket.binaryType = 'arraybuffer';

			if (Develop.isActive()) {
				Develop.logWebsocketStatus('Connecting', 'neutral');
			}
			this.webSocket.onopen = function () {
				if (Develop.isActive()) {
					Develop.logWebsocketStatus('Open', 'good');
				}
			};

			this.webSocket.onerror = function () {
				if (Develop.isActive()) {
					Develop.logWebsocketStatus('Crashed', 'bad');
				}
			};

			this.webSocket.onmessage = this.receive.bind(this);

			if (Develop.isActive()) {
				this.lastMessageReceivedTime = performance.now();
			}
		},

		send: function (messageObj) {
			if (this.webSocket.readyState !== WebSocket.OPEN) {
				// Websocket is not open (yet), ignore sending
				return;
			}

			this.webSocket.send(messageObj);
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


			this.send(this.marshalInput(inputObj));
		},

		receive: function (message) {
			if (Game.two.playing === false &&
				Game.started &&
				Develop.showNextGameState === false) {
				// Reject message
				return;
			}

			if (!message.data) {
				if (Develop.isActive()) {
					Develop.logWebsocketStatus('Receiving empty messages', 'bad');
				}
				console.warn("Received empty message.");
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
				console.error("Error converting message.data to Uint8Array.", message.data, e);
				return;
			}

			try {
				buffer = new flatbuffers.ByteBuffer(data);
			} catch (e) {
				console.error("Error creating ByteBuffer from Uint8Array.", data, e);
				return;
			}

			try {
				serverMessage = BerryhunterApi.GameState.getRootAsServerMessage(buffer);
			} catch (e) {
				console.error("Error reading ServerMessage from ByteBuffer.", buffer, e);
				return;
			}

			if (Develop.isActive()) {
				Develop.logWebsocketStatus('Open', 'good');
			}

			let timeSinceLastMessage;
			if (Develop.isActive()) {
				let messageReceivedTime = performance.now();
				timeSinceLastMessage = messageReceivedTime - this.lastMessageReceivedTime;
				this.lastMessageReceivedTime = messageReceivedTime;

			}

			switch (serverMessage.bodyType()) {
				case BerryhunterApi.ServerMessageBody.Welcome:
					if (Develop.isActive()) {
						Develop.logServerMessage(serverMessage.body(new BerryhunterApi.Welcome()), 'Welcome', timeSinceLastMessage);
					}
					break;
				case BerryhunterApi.ServerMessageBody.Accept:
					if (Develop.isActive()) {
						Develop.logServerMessage(serverMessage.body(new BerryhunterApi.Accept()), 'Accept', timeSinceLastMessage);
					}
					break;
				case BerryhunterApi.ServerMessageBody.Obituary:
					if (Develop.isActive()) {
						Develop.logServerMessage(serverMessage.body(new BerryhunterApi.Obituary()), 'Obituary', timeSinceLastMessage);
					}
					break;
				case BerryhunterApi.ServerMessageBody.GameState:
					let gameState = new GameState(serverMessage.body(new BerryhunterApi.GameState()));
					if (Develop.isActive()) {
						Develop.logServerTick(gameState, timeSinceLastMessage);
					}
					this.receiveSnapshot(SnapshotFactory.newSnapshot(gameState));
					break;
			}

		},

		/**
		 *
		 * @param {{tick: number, player: {}, entities: Array}} snapshot
		 */
		receiveSnapshot: function (snapshot) {
			Game.map.newSnapshot(snapshot.entities);

			if (Game.started) {
				if (Utils.isDefined(snapshot.player.position)) {
					Game.player.character.setPosition(snapshot.player.position.x, snapshot.player.position.y);
				}
				['health', 'satiety', 'bodyHeat'].forEach((vitalSign) => {
					if (Utils.isDefined(snapshot.player[vitalSign])) {
						Game.player.vitalSigns.setValue(vitalSign, snapshot.player[vitalSign]);
					}
				});
			} else {
				Game.createPlayer(
					snapshot.player.id,
					snapshot.player.position.x,
					snapshot.player.position.y,
					snapshot.player.name);
			}
			if (Develop.isActive()) {
				Game.player.character.updateAABB(snapshot.player.aabb);
			}

			snapshot.entities.forEach(function (entity) {
				Game.map.addOrUpdate(entity);
			});

			// FIXME Abfrage entfernen, wenn der Server tatsächlich Changesets schickt
			if (Utils.isDefined(snapshot.inventory)) {
				Game.player.inventory.updateFromBackend(snapshot.inventory);
			}
		},

		marshalInput: function (inputObj) {
			let builder = new flatbuffers.Builder(10);
			let action = null;
			if (Utils.isDefined(inputObj.action)) {
				BerryhunterApi.Action.startAction(builder);
				if (inputObj.action.item === null) {
					BerryhunterApi.Action.addItem(builder, BackendConstants.NONE_ITEM_ID);
				} else {
					BerryhunterApi.Action.addItem(builder, BackendConstants.itemLookupTable.indexOf(inputObj.action.item));
				}
				BerryhunterApi.Action.addActionType(builder, inputObj.action.actionType);
				action = BerryhunterApi.Action.endAction(builder);
			}

			BerryhunterApi.Input.startInput(builder);

			if (action !== null) {
				BerryhunterApi.Input.addAction(builder, action);
			}

			if (Utils.isDefined(inputObj.movement)) {
				BerryhunterApi.Input.addMovement(builder,
					BerryhunterApi.Vec2f.createVec2f(builder, inputObj.movement.x, inputObj.movement.y));
			}

			if (Utils.isDefined(inputObj.rotation)) {
				BerryhunterApi.Input.addRotation(builder, inputObj.rotation);
			}

			BerryhunterApi.Input.addTick(builder, flatbuffers.Long.create(inputObj.tick, 0));

			builder.finish(BerryhunterApi.Input.endInput(builder));

			return builder.asUint8Array();
		},
	};

	return Backend;
});