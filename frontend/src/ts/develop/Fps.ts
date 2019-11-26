'use strict';

import {IDevelop} from "../interfaces/IDevelop";
import {IGame} from "../interfaces/IGame";
import {PrerenderEvent} from "../Events";

let Develop: IDevelop = null;

export function setup(game: IGame, develop: IDevelop) {
    Develop = develop;
    PrerenderEvent.subscribe(update, this);
}

export function update(timeDelta: number) {
    Develop.logFPS(1000 / timeDelta);
}
