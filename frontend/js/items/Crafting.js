"use strict";

define([
	'Game',
	'Two',
	'items/ClickableIcon',
	'MapEditor',
	'Utils',
	'items/Items',
	'UserInterface'
], function (Game, Two, ClickableIcon, MapEditor, Utils, Items, UserInterface) {

	//noinspection UnnecessaryLocalVariableJS
	const Crafting = {
		displayedCrafts: [],

		displayAvailableCrafts: function (availableCrafts) {
			if (Utils.arraysEqual(this.displayedCrafts, availableCrafts)) {
				// Nothing to do here
				return;
			}

			UserInterface.displayAvailableCrafts(availableCrafts, function (event) {
				switch (event.button) {
					// Left Click
					case 0:
						if (MapEditor.isActive()) {
							for (let material in recipe.materials) {
								//noinspection JSUnfilteredForInLoop
								Game.player.inventory.removeItem(
									Items[material],
									recipe.materials[material]
								);
							}
							Game.player.inventory.addItem(recipe.item);
						} else {
							Game.player.controls.onInventoryAction(recipe.item, DeathioApi.ActionType.CraftItem);
						}
						break;
					case 2:
						// Right Click
						break;
				}
			}.bind(this));

			this.displayedCrafts = availableCrafts;
		}
	};

	return Crafting;
});