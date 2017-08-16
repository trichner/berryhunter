"use strict";

define(['Utils', 'backend/BackendConstants'], function (Utils, BackendConstants) {

	class ClientMessage {
		constructor(builder, type, body) {
			this.builder = builder;
			BerryhunterApi.ClientMessage.startClientMessage(builder);
			BerryhunterApi.ClientMessage.addBodyType(builder, type);
			BerryhunterApi.ClientMessage.addBody(builder, body);
		}

		finish() {
			this.builder.finish(BerryhunterApi.ClientMessage.endClientMessage(this.builder));
			return this.builder.asUint8Array();
		}
	}

	ClientMessage.fromInput = function (input) {
		let builder = new flatbuffers.Builder(10);
		input = marshalInput(builder, input);
		return new ClientMessage(builder, BerryhunterApi.ClientMessageBody.Input, input);
	};

	ClientMessage.fromJoin = function (join) {
		let builder = new flatbuffers.Builder(10);
		join = marshalJoin(builder, join);
		return new ClientMessage(builder, BerryhunterApi.ClientMessageBody.Join, join);
	};

	ClientMessage.fromCommand = function (command) {
		let builder = new flatbuffers.Builder(10);
		let commandString = builder.createString(command.command);
		let tokenString = builder.createString(command.token);
		BerryhunterApi.Cheat.startCheat(builder);
		BerryhunterApi.Cheat.addCommand(builder, commandString);
		BerryhunterApi.Cheat.addToken(builder, tokenString);
		return new ClientMessage(builder, BerryhunterApi.ClientMessageBody.Cheat, BerryhunterApi.Cheat.endCheat(builder));
	};

	function marshalInput(builder, inputObj) {
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

		return BerryhunterApi.Input.endInput(builder);
	}

	function marshalJoin(builder, join) {
		let playerName = builder.createString(join.playerName);
		BerryhunterApi.Join.startJoin(builder);
		BerryhunterApi.Join.addPlayerName(builder, playerName);
		return BerryhunterApi.Join.endJoin(builder);
	}

	return ClientMessage;
});