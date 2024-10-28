import {BasicConfig as Constants} from '../../../client-data/BasicConfig';
import {KeyCodes} from '../../input-system/logic/keyboard/keys/KeyCodes';
import {GameState, IGame} from "../../../old-structure/interfaces/IGame";
import {GameSetupEvent} from "../../core/logic/Events";

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
