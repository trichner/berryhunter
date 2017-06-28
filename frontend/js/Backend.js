"use strict";

define([
	'Game',
	'Utils',
	'Constants',
	'Develop',
	'items/Items',
	'vendor/flatbuffers',
	'schema_common',
	'schema_server',
	'schema_client'
], function (Game, Utils, Constants, Develop, Items) {
	//noinspection UnnecessaryLocalVariableJS
	const Backend = {
		setup: function () {
			this.prepareItemLookupTable();

			if (Utils.getUrlParameter(Constants.MODE_PARAMETERS.LOCAL_SERVER)) {
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

		prepareItemLookupTable: function () {
			// DeathioApi.Item is an enum with numeric indices
			// so the lookup table can be an array
			this.itemLookupTable = [];
			this.noneItem = "NONE_ITEM";
			for (let item in DeathioApi.Item) {
				if (!DeathioApi.Item.hasOwnProperty(item)) {
					continue;
				}

				let lookedupItem;
				if (item === 'None') {
					lookedupItem = this.noneItem;
				} else {
					if (Items.hasOwnProperty(item)) {
						lookedupItem = Items[item];
					} else {
						console.error('Item "' + item + '" defined in DeathioApi.Item is unknown in items/Items.');
					}
				}

				this.itemLookupTable[DeathioApi.Item[item]] = lookedupItem;
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
			if (Utils.isUndefined(this.lastServerTick)) {
				// If the backend hasn't send a snapshot yet, don't send any input.
				return;
			}

			inputObj.tick = this.lastServerTick + 1;

			if (Develop.isActive()) {
				Develop.logClientTick(inputObj);
			}


			this.send(this.marshalInput(inputObj));
		},

		receive: function (event) {
			if (!Game.two.playing && Game.started) {
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
		 * @param {{tick: number, player: {}, entities: Array}} snapshot
		 */
		receiveSnapshot: function (snapshot) {
			this.lastServerTick = snapshot.tick;

			Game.map.newSnapshot();

			if (Game.started) {
				Game.player.character.setPosition(snapshot.player.x, snapshot.player.y);
			} else {
				Game.createPlayer(snapshot.player.id, snapshot.player.x, snapshot.player.y);
			}
			if (Develop.isActive()) {
				Game.player.character.updateAABB(snapshot.player.aabb);
			}

			snapshot.entities.forEach(function (entity) {
				Game.map.addOrUpdate(entity);
			});
		},

		/**
		 * @param {DeathioApi.GameState} gameState
		 * @return {{tick: number, playerId: number, entities: Array}}
		 */
		unmarshalGameState(gameState){
			let result = {
				tick: gameState.tick().toFloat64(),

				player: this.unmarshalEntity(gameState.player()),
				inventory: [],

				entities: []
			};

			for (let i = 0; i < gameState.inventoryLength(); ++i) {
				var itemStack = this.unmarshalItemStack(gameState.inventory(i));
				result.inventory[itemStack.slot] = itemStack;
			}

			for (let i = 0; i < gameState.entitiesLength(); ++i) {
				result.entities.push(this.unmarshalEntity(gameState.entities(i)));
			}

			return result;
		},

		/**
		 *
		 * @param {DeathioApi.ItemStack} itemStack
		 */
		unmarshalItemStack(itemStack){
			return {
				item: this.unmarshalItem(itemStack.item()),
				count: itemStack.count(),
				slot: itemStack.slot()
			};
		},

		/**
		 * @param {DeathioApi.Item} item
		 */
		unmarshalItem(item){
			return this.itemLookupTable[item];
		},

		/**
		 * @param {DeathioApi.Entity} entity
		 */
		unmarshalEntity(entity){
			return {
				id: entity.id().toFloat64(),
				x: entity.pos().x(),
				y: entity.pos().y(),
				radius: entity.radius(),
				rotation: entity.rotation(),
				type: entity.entityType(),
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

		marshalInput: function (inputObj) {
			let builder = new flatbuffers.Builder(10);
			let action = null;
			if (Utils.isDefined(inputObj.action)) {
				DeathioApi.Action.startAction(builder);
				DeathioApi.Action.addItem(builder, DeathioApi.Item[inputObj.action.item]);
				action = DeathioApi.Action.endAction(builder);
			}

			DeathioApi.Input.startInput(builder);

			if (action !== null) {
				DeathioApi.Input.addAction(builder, action);
			}

			if (Utils.isDefined(inputObj.movement)) {
				DeathioApi.Input.addMovement(builder,
					DeathioApi.Vec2f.createVec2f(builder, inputObj.movement.x, inputObj.movement.y));
			}

			if (Utils.isDefined(inputObj.rotation)) {
				DeathioApi.Input.addRotation(builder, inputObj.rotation);
			}

			DeathioApi.Input.addTick(builder, flatbuffers.Long.create(inputObj.tick, 0));

			builder.finish(DeathioApi.Input.endInput(builder));

			return builder.asUint8Array();
		}
	};

	return Backend;
});