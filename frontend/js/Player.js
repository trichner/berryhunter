'use strict';

define([
	'Game',
	'gameObjects/Character',
	'Controls',
	'Camera',
	'items/Inventory',
	'VitalSigns',
	'Utils',
	'Constants'
], function (Game, Character, Controls, Camera, Inventory, VitalSigns, Utils, Constants) {
	class Player {
		constructor(id, x, y, name) {
			/**
			 * Either <code>null</code> or number of seconds
			 * remaining until the current craft is done.
			 * @type {boolean|number}
			 */
			this.craftProgress = null;

			this.character = new Character(id, x, y, name, true);
			this.character.visibleOnMinimap = true;

			this.controls = new Controls(this.character, this.isCraftInProgress.bind(this));

			this.camera = new Camera(this.character);
			Game.miniMap.add(this.character);

			this.inventory = new Inventory(this.character, this.isCraftInProgress.bind(this));

			this.vitalSigns = new VitalSigns();

			this.craftableItems = [];
		}

		init() {
			this.inventory.init();
		}

		isCraftInProgress() {
			return this.craftProgress !== null;
		}

		startCraftProgress(craftingTime) {
			this.craftProgress = {
				requiredTicks: craftingTime * 1000 / Constants.SERVER_TICKRATE
			};
			this.craftProgress.remainingTicks = this.craftProgress.requiredTicks;
			this.character.craftingIndicator.visible = true;
		}

		updateFromBackend(entity) {
			if (Utils.isDefined(entity.position)) {
				this.character.setPosition(entity.position.x, entity.position.y);
			}
			let newVitalSigns = {};
			['health', 'satiety', 'bodyHeat'].forEach((vitalSign) => {
				newVitalSigns[vitalSign] = entity[vitalSign];
			});
			this.vitalSigns.updateFromBackend(newVitalSigns);

			/**
			 * Handle Actions
			 */
			if (entity.currentAction) {
				switch (entity.currentAction.actionType) {
					case BerryhunterApi.ActionType.CraftItem:
						if (!this.isCraftInProgress()) {
							console.error("Invalid State: Received craftItem action, but no crafting is in progress.");
							break;
						}
						let ticksRemaining = entity.currentAction.ticksRemaining;
						this.craftProgress.remainingTicks = ticksRemaining;
						entity.currentAction.item.recipe.clickableIcon.updateProgress(ticksRemaining);
						break;
				}
			}
		}

		remove() {
			this.character.remove();
			this.controls.destroy();
			this.camera.destroy();
			this.inventory.clear();
			this.vitalSigns.destroy();
		}
	}

	return Player;
});