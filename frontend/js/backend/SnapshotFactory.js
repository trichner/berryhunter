"use strict";

define(['Utils'], function (Utils) {
	let SnapshotFactory = {};

	SnapshotFactory.newSnapshot = function (gameState) {
		let snapshot;
		if (this.hasSnapshot()){
			snapshot = {};
			snapshot.tick = gameState.tick;

			if (!Utils.nearlyEqual(this.lastSnapshot.player.x, gameState.player.x, 0.01) ||
				!Utils.nearlyEqual(this.lastSnapshot.player.y, gameState.player.y, 0.01)){
				snapshot.player = gameState.player;
			}

			if (isInventoryDifferent(this.lastSnapshot.inventory, gameState.inventory)){
				snapshot.inventory = gameState.inventory;
			}

			// GameMapWithBackend handles entity states
			snapshot.entities = gameState.entities;
		} else {
			snapshot = gameState;
		}

		this.lastSnapshot = snapshot;

		return snapshot;
	};

	SnapshotFactory.hasSnapshot = function () {
		return Utils.isDefined(this.lastSnapshot);
	};

	SnapshotFactory.getLastSnapshot = function () {
		return this.lastSnapshot;
	};

	/**
	 *
	 * @param lastInventory
	 * @param inventory
	 */
	function isInventoryDifferent(lastInventory, inventory){
		if (lastInventory.length !== inventory.length) {
			return true;
		}

		for (let i = 0; i < inventory.length; i++) {
			let lastItemStack = lastInventory[i];
			let itemStack = inventory[i];
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