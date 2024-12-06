import {IDevelop} from "./IDevelop";
import {IGame} from "../../../core/logic/IGame";
import {PrerenderEvent} from "../../../core/logic/Events";

let Develop: IDevelop = null;

export function setup(game: IGame, develop: IDevelop) {
    Develop = develop;
    PrerenderEvent.subscribe(update, this);
}

export function update(timeDelta: number) {
    Develop.logFPS(1000 / timeDelta);
}
