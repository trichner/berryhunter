import {BasicConfig as Constants} from '../../game-data/BasicConfig';
import {KeyCodes} from '../input/keyboard/keys/KeyCodes';
import {GameState, IGame} from "../interfaces/IGame";
import {GameSetupEvent} from "../Events";

let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
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
