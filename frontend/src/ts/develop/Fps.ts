'use strict';

import * as Develop from './_Develop';


export function setup(game) {
    game.renderer.on('prerender', this.update.bind(this, game));
}

export function update(game) {
    Develop.logFPS(1000 / game.timeDelta);
}
