/**
 * Exposes certain functionality in the browser console.
 */
import {BackendValidTokenEvent, GameSetupEvent, PlayerCreatedEvent} from './Events';
import * as Console from './Console';
import {Player} from "./Player";
import {IGame} from "./interfaces/IGame";


function setup() {
    // only enable this class if token is valid
    let consoleCommands = {
        run: undefined,
        character: undefined,
        pause: undefined,
        play: undefined,
    };

    consoleCommands.run = Console.run;
    PlayerCreatedEvent.subscribe((player: Player) => {
        consoleCommands.character = player.character;
        return true;
    });

    GameSetupEvent.subscribe((game: IGame) => {
        consoleCommands.pause = game.pause;
        consoleCommands.play = game.play;

        return true;
    });

    window['game'] = consoleCommands;
}

BackendValidTokenEvent.subscribe(setup);
