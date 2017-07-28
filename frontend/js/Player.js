"use strict";

define([
	'Game',
	'gameObjects/Character',
	'Controls',
	'Camera',
	'items/Inventory',
	'VitalSigns'
], function (Game, Character, Controls, Camera, Inventory, VitalSigns) {
	class Player {
		constructor(id, x, y) {
			this.character = new Character(id, x, y);
			this.character.visibleOnMinimap = true;

			this.controls = new Controls(this.character);

			// Has to be registered only when it's the player character as
			// we don't want to manipulate other players characters that are shown
			Game.two.bind('update', this.character.update.bind(this.character));

			this.camera = new Camera(this.character);
			Game.miniMap.add(this.character);

			this.inventory = new Inventory(this.character);

			this.vitalSigns = new VitalSigns();

			this.craftableItems = [];
		}
	}

	return Player;
});