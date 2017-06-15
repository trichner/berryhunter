/**
 * Created by raoulzander on 25.04.17.
 */
"use strict";

const MessageType = {
	OBJECT: 'OBJECT',
	SNAPSHOT: 'GAME_STATE'
};

const Backend = {
	setup: function () {
		if (getUrlParameter(Constants.MODE_PARAMETERS.LOCAL_SERVER)) {
			this.webSocket = new WebSocket('ws://' + window.location.host + '/game');
		} else {
			this.webSocket = new WebSocket(Constants.BACKEND.REMOTE_URL);
		}

		this.webSocket.binaryType = 'arraybuffer';

		if (Develop.isActive()) {
			Develop.logWebsocketStatus('Connecting', 'neutral');
		}
		this.webSocket.onopen = function () {
			if (Develop.isActive()) {
				Develop.logWebsocketStatus('Open', 'good');
			}
			console.log("WebSocket: Open");
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

		// TODO FlatBuffers
		// this.webSocket.send(JSON.stringify(messageObj));
	},

	receive: function (event) {
		if (!two.playing && gameStarted) {
			return;
		}

		if (!event.data) {
			if (Develop.isActive()) {
				Develop.logWebsocketStatus('Receiving empty messages', 'bad');
			}
			console.warn("Received empty message.");
			return;
		}

		let data, buffer, gameState;
		try {
			data = new Uint8Array(event.data);
		} catch (e) {
			console.error("Error converting event.data to Uint8Array.", event.data, e);
			return;
		}

		try {
			buffer = new flatbuffers.ByteBuffer(data);
		} catch (e) {
			console.error("Error creating ByteBuffer from Uint8Array.", data, e);
			return;
		}

		try {
			gameState = DeathioApi.GameState.getRootAsGameState(buffer);
		} catch (e) {
			console.error("Error reading GameState from ByteBuffer.", buffer, e);
			return;
		}

		try {
			gameState = this.unmarshalGameState(gameState);
		} catch (e) {
			console.error("Error unmarshalling GameState from FlatBuffer object.", gameState, e);
			return;
		}

		if (Develop.isActive()) {
			Develop.logWebsocketStatus('Open', 'good');
		}

		if (Develop.isActive()) {
			let messageReceivedTime = performance.now();
			let timeSinceLastMessage = messageReceivedTime - this.lastMessageReceivedTime;
			this.lastMessageReceivedTime = messageReceivedTime;
			Develop.logServerTick(gameState, timeSinceLastMessage);
		}
		this.receiveSnapshot(gameState);
	},

	/**
	 *
	 * @param {{tick: number, playerId: number, entities: Array}} snapshot
	 */
	receiveSnapshot: function (snapshot) {
		this.lastServerTick = snapshot.tick;

		gameMap.newSnapshot();

		// TODO revert to old snapshot
		snapshot.entities.forEach(function (entity) {
			if (entity.id === snapshot.playerId) {
				if (gameStarted) {
					player.character.setPosition(entity.x, entity.y);
				} else {
					createPlayer(entity.id, entity.x, entity.y);
				}
				if (Develop.isActive()) {
					player.character.updateAABB(entity.aabb);
				}
			} else {
				gameMap.addOrUpdate(entity);
			}
		});
	},

	/**
	 * @param {DeathioApi.GameState} gameState
	 * @return {{tick: number, playerId: number, entities: Array}}
	 */
	unmarshalGameState(gameState){
		let result = {
			tick: gameState.tick().toFloat64(),
			playerId: gameState.playerId().toFloat64(),
			entities: []
		};

		for (let i = 0; i < gameState.entitiesLength(); ++i) {
			result.entities.push(this.unmarshalEntity(gameState.entities(i)));
		}

		return result;
	},

	/**
	 *
	 * @param {DeathioApi.Entity} entity
	 */
	unmarshalEntity(entity){
		return {
			id: entity.id().toFloat64(),
			x: entity.pos().x(),
			y: entity.pos().y(),
			radius: entity.radius(),
			rotation: entity.rotation(),
			object: entity.type(),
			aabb: this.unmarshalAABB(entity.aabb())
		}
	},

	/**
	 *
	 * @param {DeathioApi.AABB} aabb
	 */
	unmarshalAABB(aabb){
		return {
			LowerX: aabb.lower().x(),
			LowerY: aabb.lower().y(),
			UpperX: aabb.upper().x(),
			UpperY: aabb.upper().y(),
		}
	},

	sendInputTick: function (inputObj) {
		if (typeof this.lastServerTick === 'undefined') {
			// If the backend hasn't send a snapshot yet, don't send any input.
			return;
		}

		inputObj.tick = this.lastServerTick + 1;

		if (Develop.isActive()) {
			Develop.logClientTick(inputObj.tick);
		}


		this.send(this.marshalInput(inputObj));
	},

	marshalInput: function (inputObj) {
		let builder = new flatbuffers.Builder(10);
		let action = null;
		if (isDefined(inputObj.action)) {
			DeathioApi.Action.startAction(builder);
			DeathioApi.Action.addItem(builder, DeathioApi.Item[inputObj.action.item]);
			action = DeathioApi.Action.endAction(builder);
		}

		DeathioApi.Input.startInput(builder);

		if (action !== null) {
			DeathioApi.Input.addAction(builder, action);
		}

		if (isDefined(inputObj.movement)) {
			DeathioApi.Input.addMovement(builder,
				DeathioApi.Vec2f.createVec2f(builder, inputObj.movement.x, inputObj.movement.y));
		}

		if (isDefined(inputObj.rotation)) {
			DeathioApi.Input.addRotation(builder, inputObj.rotation);
		}

		DeathioApi.Input.addTick(builder, flatbuffers.Long.create(inputObj.tick));

		builder.finish(DeathioApi.Input.endInput(builder));

		return builder.asUint8Array();
	}
};