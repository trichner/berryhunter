'use strict';

import * as Game from '../Game';
import * as Develop from './_Develop';


export function setup() {
    Game.renderer.on('prerender', this.update.bind(this));
}

export function update() {
    Develop.logFPS(1000 / Game.timeDelta);
}
