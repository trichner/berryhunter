"use strict";

define([
	'Game',
	'MapEditor',
	'Utils',
	'items/Items',
	'UserInterface'
], function (Game, MapEditor, Utils, Items, UserInterface) {

	//noinspection UnnecessaryLocalVariableJS
	const Crafting = {
		displayedCrafts: [],

		displayAvailableCrafts: function (availableCrafts) {
			if (Utils.arraysEqual(this.displayedCrafts, availableCrafts)) {
				// Nothing to do here
				return;
			}

			// Add to the list of available (=rendered) crafts the currently displayed crafts that are in progress
			// https://trello.com/c/oT8FLSHZ
			availableCrafts = availableCrafts.concat(this.displayedCrafts.filter(function (recipe) {
				if (Utils.isUndefined(recipe.clickableIcon)) {
					return false;
				}

				if (!recipe.clickableIcon.inProgress) {
					return false;
				}

				// Only add the craft if it is not already part of available crafts
				return availableCrafts.indexOf(recipe) === -1;
			}));

			let onCraftIconLeftClick = function (event, recipe) {
				if (MapEditor.isActive()) {
					for (let material in recipe.materials) {
						//noinspection JSUnfilteredForInLoop
						Game.player.inventory.removeItem(
							Items[material],
							recipe.materials[material],
						);
					}
					Game.player.inventory.addItem(recipe.item);
				} else {
					let actionAllowed = Game.player.controls
						.onInventoryAction(
							recipe.item,
							BerryhunterApi.ActionType.CraftItem);
					if (actionAllowed) {
						this.startProgress(recipe.craftingTime);
						Game.player.startCraftProgress(recipe.craftingTime);
					}
				}
			};
			UserInterface.displayAvailableCrafts(availableCrafts, onCraftIconLeftClick);

			this.displayedCrafts = availableCrafts;
		}
	};

	return Crafting;
});