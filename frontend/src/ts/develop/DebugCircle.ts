import {GameObject} from '../gameObjects/_GameObject';
import * as PIXI from 'pixi.js';
import {hasAABB} from './AABBs';
import {IGame} from '../interfaces/IGame';
import {Develop} from './_Develop';
import {GameSetupEvent, PrerenderEvent} from '../Events';

let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
    Game = game;
});


export class DebugCircle extends GameObject {
    timeToLife: number;

    constructor(id: number, x, y, radius) {
        super(id,undefined, x, y, radius, 0, undefined);
        this.visibleOnMinimap = false;

        this.timeToLife = 60;

        PrerenderEvent.subscribe((timeDelta: number) => {
            this.timeToLife -= timeDelta;
            if (this.timeToLife < 0) {
                this.hide();
                delete Game.map.objects[this.id];
                // @ts-ignore
                let thisHasAABB = this as hasAABB;
                thisHasAABB.aabb.parent.removeChild(thisHasAABB.aabb);
                thisHasAABB.aabbConnector.parent.removeChild(thisHasAABB.aabbConnector);

                // Remove listener
                return true;
            }
        }, this);
    }

    createShape(x: number, y: number) {
        return new PIXI.Graphics()
            .circle(x, y, this.size / 2)
            .stroke({width: Develop.get().settings.linewidth, color: 0xFFFF00});
    }
}
