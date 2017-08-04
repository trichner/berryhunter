"use strict";

define([
	'Game',
	'Utils',
	'Constants',
	'Develop',
	'items/Items',
	'gameObjects/Resources',
	'gameObjects/Animals',
	'develop/DebugCircle',
	'gameObjects/Border',
	'gameObjects/Character',
	'gameObjects/Placeable',
	'backend/SnapshotFactory',
	'vendor/flatbuffers',
	'schema_common',
	'schema_server',
	'schema_client',
], function (Game, Utils, Constants, Develop, Items, Resources, Animals, DebugCircle, Border, Character, Placeable, SnapshotFactory) {
	/**
	 * Has to be in sync with DeathioApi.EntityType
	 */
	const gameObjectClasses = [
		DebugCircle,
		Border,
		Resources.RoundTree,
		Resources.MarioTree,
		Character,
		Resources.Stone,
		Resources.Bronze,
		null,
		Resources.BerryBush,
		Animals.Rabbit,
		Animals.SaberToothCat,
		Animals.Mammoth,
		Placeable,
	];

	const NONE_ITEM_ID = 0;

	const itemLookupTable = [];

	function initializeItemLookupTable() {
		itemLookupTable[NONE_ITEM_ID] = null;
		for (let itemName in Items) {
			//noinspection JSUnfilteredForInLoop
			let item = Items[itemName];
			itemLookupTable[item.id] = item;
		}
	}

	//noinspection UnnecessaryLocalVariableJS
	const Backend = {
		setup: function () {
			initializeItemLookupTable();

			let url;
			if (Utils.getUrlParameter(Constants.MODE_PARAMETERS.LOCAL_SERVER)) {
				url = 'ws://' + window.location.host + '/game';
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

			let data, buffer, gameState;
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
			this.receiveSnapshot(SnapshotFactory.newSnapshot(gameState));
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

		/**
		 * @param {DeathioApi.GameState} gameState
		 * @return {{tick: number, playerId: number, entities: Array}}
		 */
		unmarshalGameState(gameState) {
			let result = {
				tick: gameState.tick().toFloat64(),

				player: this.unmarshalEntity(gameState.player(), DeathioApi.AnyEntity.Player),
				inventory: [],

				entities: [],
			};

			for (let i = 0; i < gameState.inventoryLength(); ++i) {
				let itemStack = this.unmarshalItemStack(gameState.inventory(i));
				result.inventory[itemStack.slot] = itemStack;
			}

			for (let i = 0; i < gameState.entitiesLength(); ++i) {
				result.entities.push(this.unmarshalWrappedEntity(gameState.entities(i)));
			}

			return result;
		},

		/**
		 * @param {DeathioApi.Entity} wrappedEntity
		 */
		unmarshalWrappedEntity(wrappedEntity) {
			let eType = wrappedEntity.eType();
			let entity;

			for (let eTypeName in DeathioApi.AnyEntity) {
				if (DeathioApi.AnyEntity[eTypeName] === eType) {
					entity = new DeathioApi[eTypeName]();
				}
			}
			/**
			 *
			 * @type {DeathioApi.Mob | DeathioApi.Resource | DeathioApi.Player}
			 */
			entity = wrappedEntity.e(entity);

			return this.unmarshalEntity(entity, eType);
		},

		unmarshalEntity(entity, eType) {
			let result = {
				id: entity.id().toFloat64(),
				position: {
					x: entity.pos().x(),
					y: entity.pos().y(),
				},
				radius: entity.radius(),
				type: this.unmarshalEntityType(entity.entityType()),
				aabb: this.unmarshalAABB(entity.aabb()),
			};

			if (eType === DeathioApi.AnyEntity.Placeable) {
				result.item = this.unmarshalItem(entity.item());
			}

			if (eType === DeathioApi.AnyEntity.Mob) {
				result.rotation = entity.rotation();
			}

			if (eType === DeathioApi.AnyEntity.Player) {
				result.rotation = entity.rotation();
				result.isHit = entity.isHit();
				result.actionTick = entity.actionTick();
				result.name = entity.name();
				result.equipment = [];

				result.health = entity.health();
				result.satiety = entity.satiety();
				result.bodyHeat = entity.bodyTemperature();

				for (let i = 0; i < entity.equipmentLength(); ++i) {
					result.equipment.push(this.unmarshalItem(entity.equipment(i)));
				}
			}

			return result
		},

		unmarshalEntityType(entityType) {
			return gameObjectClasses[entityType];
		},

		/**
		 *
		 * @param {DeathioApi.AABB} aabb
		 */
		unmarshalAABB(aabb) {
			return {
				LowerX: aabb.lower().x(),
				LowerY: aabb.lower().y(),
				UpperX: aabb.upper().x(),
				UpperY: aabb.upper().y(),
			}
		},

		/**
		 *
		 * @param {DeathioApi.ItemStack} itemStack
		 */
		unmarshalItemStack(itemStack) {
			return {
				item: this.unmarshalItem(itemStack.item()),
				count: itemStack.count(),
				slot: itemStack.slot(),
			};
		},

		/**
		 * @param {number} itemId
		 */
		unmarshalItem(itemId) {
			return itemLookupTable[itemId];
		},

		marshalInput: function (inputObj) {
			let builder = new flatbuffers.Builder(10);
			let action = null;
			if (Utils.isDefined(inputObj.action)) {
				DeathioApi.Action.startAction(builder);
				if (inputObj.action.item === null) {
					DeathioApi.Action.addItem(builder, NONE_ITEM_ID);
				} else {
					DeathioApi.Action.addItem(builder, itemLookupTable.indexOf(inputObj.action.item));
				}
				DeathioApi.Action.addActionType(builder, inputObj.action.actionType);
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
		},
	};

	return Backend;
});