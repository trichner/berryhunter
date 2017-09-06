"use strict";

define([
	'Game',
	'gameObjects/Character',
	'Controls',
	'Camera',
	'items/Inventory',
	'VitalSigns',
	'StartScreen'
], function (Game, Character, Controls, Camera, Inventory, VitalSigns) {
	class Player {
		constructor(id, x, y, name) {
			this.character = new Character(id, x, y, name);
			this.character.visibleOnMinimap = true;

			this.controls = new Controls(this.character);

			this.camera = new Camera(this.character);
			Game.miniMap.add(this.character);

			this.inventory = new Inventory(this.character);

			this.vitalSigns = new VitalSigns();

			this.craftableItems = [];
		}

		remove() {
			this.character.hide();
			this.controls.destroy();
			this.camera.destroy();
		}
	}

	return Player;
});