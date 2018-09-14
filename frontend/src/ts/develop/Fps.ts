'use strict';

let Develop = null;

export function setup(game, develop) {
    Develop = develop;
    game.renderer.on('prerender', this.update.bind(this, game));
}

export function update(game) {
    Develop.logFPS(1000 / game.timeDelta);
}
