'use strict';

define(['Game', 'input/keyboard/keys/KeyCodes'], function (Game, KeyCodes) {
	window.addEventListener('keydown', function (event) {
		if (Game.state !== Game.States.PLAYING) {
			return;
		}

		if (event.keyCode >= KeyCodes.ONE && event.keyCode <= KeyCodes.NINE) {
			let slotIndex = event.keyCode - KeyCodes.ONE;
			let inventorySlot = Game.player.inventory.slots[slotIndex];
			inventorySlot.leftClick();
		}
	})
});