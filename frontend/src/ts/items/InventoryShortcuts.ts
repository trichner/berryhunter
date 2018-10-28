'use strict';

import {BasicConfig as Constants} from '../../config/Basic';
import {KeyCodes} from '../input/keyboard/keys/KeyCodes';
import * as Events from "../Events";

let Game = null;
Events.on('game.setup', game => {
    Game = game;
});

window.addEventListener('keydown', function (event) {
    if (Game.state !== Game.States.PLAYING) {
        return;
    }

    if (event.keyCode >= KeyCodes.ONE && event.keyCode <= KeyCodes.NINE) {
        let slotIndex = event.keyCode - KeyCodes.ONE;
        if (slotIndex >= Constants.INVENTORY_SLOTS) {
            return;
        }
        let inventorySlot = Game.player.inventory.slots[slotIndex];
        inventorySlot.leftClick();
    }
});