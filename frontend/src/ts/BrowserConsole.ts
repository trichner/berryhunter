'use strict';

/**
 * Exposes certain functionality in the browser console.
 */
import * as Events from './Events';
import * as Console from './Console';


function setup() {
    // only enable this class if token is valid
    let consoleCommands = {
        run: undefined,
        character: undefined,
        pause: undefined,
        play: undefined,
    };

    consoleCommands.run = Console.run;
    Events.on('game.playing', function (Game) {
        consoleCommands.character = Game.player.character;
        return true;
    });

    Events.on('game.setup', function (Game) {
        consoleCommands.pause = Game.pause;
        consoleCommands.play = Game.play;
        return true;
    });

    window['game'] = consoleCommands;
}

Events.on('backend.validToken', setup);