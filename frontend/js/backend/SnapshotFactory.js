"use strict";

define(['Utils', 'underscore'], function (Utils, _) {
	let SnapshotFactory = {};

	let lastGameState;

	SnapshotFactory.newSnapshot = function (gameState) {
		let snapshot;
		if (this.hasSnapshot()){
			snapshot = {};
			snapshot.tick = gameState.tick;

			snapshot.player =  _.clone(gameState.player);

			if (Utils.nearlyEqual(lastGameState.player.position.x, gameState.player.position.x, 0.01) &&
				Utils.nearlyEqual(lastGameState.player.position.y, gameState.player.position.y, 0.01)){
				delete snapshot.player.position;
			}

			if (isInventoryDifferent(lastGameState.inventory, gameState.inventory)){
				snapshot.inventory = gameState.inventory;
			}

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

	/**
	 *
	 * @param lastInventory
	 * @param inventory
	 */
	function isInventoryDifferent(lastInventory, inventory) {
		if (lastInventory.length !== inventory.length) {
			return true;
		}

		for (let i = 0; i < inventory.length; i++) {
			let lastItemStack = lastInventory[i];
			let itemStack = inventory[i];
			if (lastItemStack === itemStack) {
				return false;
			}

			if (Utils.isUndefined(lastItemStack)){
				return true;
			}

			if (Utils.isUndefined(itemStack)){
				return true;
			}

			if (lastItemStack.item !== itemStack.item) {
				return true;
			}
			if (lastItemStack.count !== itemStack.count) {
				return true;
			}
			if (lastItemStack.slot !== itemStack.slot) {
				return true;
			}
		}

		return false;
	}

	return SnapshotFactory;
});