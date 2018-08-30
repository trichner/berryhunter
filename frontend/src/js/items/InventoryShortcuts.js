'use strict';

define(['Game', 'Constants', 'input/keyboard/keys/KeyCodes'], function (Game, Constants, KeyCodes) {
	window.addEventListener('keydown', function (event) {
		if (Game.state !== Game.States.PLAYING) {
			return;
		}

		if (event.keyCode >= KeyCodes.ONE && event.keyCode <= KeyCodes.NINE) {
			let slotIndex = event.keyCode - KeyCodes.ONE;
			if (slotIndex >= Constants.INVENTORY_SLOTS){
				return;
			}
			let inventorySlot = Game.player.inventory.slots[slotIndex];
			inventorySlot.leftClick();
		}
	})
});