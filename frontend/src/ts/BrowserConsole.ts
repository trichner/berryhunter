'use strict';

/**
 * Exposes certain functionality in the browser console.
 * TODO: validate token against backend and only enable this class if token is valid
 */
import * as Events from './Events';
import * as Console from './Console';

let consoleCommands = {
    run: undefined,
    character: undefined,
    pause: undefined,
    play: undefined,
};
consoleCommands.run = Console.run;
Events.on('game.playing', function (Game) {
    consoleCommands.character = Game.player.character;
});

Events.on('gameSetup', function (Game) {
    consoleCommands.pause = Game.pause;
    consoleCommands.play = Game.play;
});

window['game'] = consoleCommands;