'use strict';

import * as Game from '../Game';
import {GameObject} from '../gameObjects/_GameObject';
import * as Develop from '../develop/_Develop';
import * as PIXI from 'pixi.js';
import {hasAABB} from './AABBs';


export class DebugCircle extends GameObject {
    timeToLife: number;

    constructor(x, y, radius) {
        super(undefined, x, y, radius, 0, undefined);
        this.visibleOnMinimap = false;

        this.timeToLife = 60;

        Game.renderer.on('prerender', () => {
            this.timeToLife -= Game.timeDelta;
            if (this.timeToLife < 0) {
                this.hide();
                delete Game.map.objects[this.id];
                // @ts-ignore
                let thisHasAABB = this as hasAABB;
                thisHasAABB.aabb.parent.removeChild(thisHasAABB.aabb);
                thisHasAABB.aabbConnector.parent.removeChild(thisHasAABB.aabbConnector);
            }
        }, this);
    }

    createShape(x, y) {
        let circle = new PIXI.Graphics();
        circle.lineColor = 0xFFFF00;
        circle.lineWidth = Develop.settings.linewidth;
        circle.drawCircle(x, y, this.size / 2);
        return circle;
    }
}