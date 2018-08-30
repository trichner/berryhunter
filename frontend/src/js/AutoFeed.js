'use strict';

define(['Game', 'Events', 'GraphicsConfig', 'Utils', 'underscore', 'schema_client'], function (Game, Events, GraphicsConfig, Utils, _) {
	const AutoFeed = {};
	AutoFeed.activeInventorySlot = null;
	AutoFeed.lastAutoFeed = Date.now();

	AutoFeed.activate = function (payload) {
		this.activeInventorySlot = payload.inventorySlot;
	};

	AutoFeed.deactivate = function () {
		this.activeInventorySlot = null;
	};

	AutoFeed.checkChangedVitalSign = function (payload) {
		// If there's no slot, auto feed is not active
		if (this.activeInventorySlot === null) {
			return;
		}

		// Check if enough time is elapsed before the Auto feed triggers again.
		// This is mainly to prevent the auto feed being triggered more than once before
		// there is an update in satiety from the backend
		let now = Date.now();
		if (Utils.dateDiff(now, this.lastAutoFeed) < 500) {
			return;
		}

		if (payload.vitalSign !== 'satiety') {
			return;
		}

		let satiety = payload.newValue.relative;
		// Definitely eat something if the satiety is completely gone
		if (satiety === 0) {
			this.eat(now);
			return;
		}

		// Don't eat if the satiety is above the critical threshold
		if (satiety >= GraphicsConfig.vitalSigns.overlayThreshold) {
			return;
		}

		// Wait with eating until the food can have the maximum effect
		if (satiety + this.getFoodFactor() > 1.0) {
			return;
		}

		this.eat(now);
	};

	AutoFeed.eat = function (now) {
		if (Game.player.controls.onInventoryAction(
				this.activeInventorySlot.item,
				BerryhunterApi.ActionType.ConsumeItem)) {
			Utils.playCssAnimation(this.activeInventorySlot.domElement, 'eating');
			this.lastAutoFeed = now;
		}
	};

	AutoFeed.getFoodFactor = function () {
		return this.activeInventorySlot.item.factors.food;
	};

	Events.on('autoFeed.activate', AutoFeed.activate.bind(AutoFeed));
	Events.on('autoFeed.deactivate', AutoFeed.deactivate.bind(AutoFeed));
	Events.on('vitalSign.change', AutoFeed.checkChangedVitalSign.bind(AutoFeed));

	AutoFeed.isItemSuitable = function (item) {
		if (!_.isObject(item.factors)) {
			return false;
		}

		// Food = 0 is stuff that can't be eaten
		// Food <= 0.05 is stuff you can eat, but would not on a regular basis
		return item.factors.food > 0.05;
	};

	return AutoFeed;
});