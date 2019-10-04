'use strict';

import {BasicConfig as Constants} from '../../config/Basic';
import {KeyCodes} from '../input/keyboard/keys/KeyCodes';
import * as Events from "../Events";
import {GameState, IGame} from "../interfaces/IGame";

let Game: IGame = null;
Events.on('game.setup', game => {
    Game = game;
});

window.addEventListener('keydown', function (event) {
    if (Game.state !== GameState.PLAYING) {
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