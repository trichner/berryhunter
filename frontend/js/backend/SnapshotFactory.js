"use strict";

define(['Utils', 'underscore'], function (Utils, _) {
	let SnapshotFactory = {};

	let lastGameState;

	SnapshotFactory.newSnapshot = function (backendState, gameState) {
		let snapshot;
		if (this.hasSnapshot()) {
			snapshot = {};
			snapshot.tick = gameState.tick;

			snapshot.player = _.clone(gameState.player);

			if (backendState === 'PLAYING' &&
				!lastGameState.player.isSpectator &&
				Utils.nearlyEqual(lastGameState.player.position.x, gameState.player.position.x, 0.01) &&
				Utils.nearlyEqual(lastGameState.player.position.y, gameState.player.position.y, 0.01)) {
				delete snapshot.player.position;
			}

			// Inventory handles item stacks
			snapshot.inventory = gameState.inventory;

			// GameMapWithBackend handles entity states
			snapshot.entities = gameState.entities;
		} else {
			snapshot = gameState;
		}

		lastGameState = gameState;

		return snapshot;
	};

	SnapshotFactory.hasSnapshot = function () {
		return Utils.isDefined(lastGameState);
	};

	SnapshotFactory.getLastGameState = function () {
		return lastGameState;
	};

	return SnapshotFactory;
});