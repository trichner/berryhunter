'use strict';

import * as Game from '../Game';
import GameObject from '../gameObjects/_GameObject';
import * as Develop from '../develop/_Develop';
import * as PIXI from 'pixi.js';


export default class DebugCircle extends GameObject {
    timeToLife: number;

    constructor(x, y, radius) {
        super(x, y, radius);
        this.visibleOnMinimap = false;

        this.timeToLife = 60;

        Game.renderer.on('prerender', () => {
            this.timeToLife -= Game.timeDelta;
            if (this.timeToLife < 0) {
                this.hide();
                delete Game.map.objects[this.id];
                this.aabb.parent.removeChild(this.aabb);
                this.aabbConnector.parent.removeChild(this.aabbConnector);
            }
        }, this);
    }

    createShape(x, y, radius) {
        let circle = new PIXI.Graphics();
        circle.lineColor = 0xFFFF00;
        circle.lineWidth = Develop.settings.linewidth;
        circle.drawCircle(x, y, radius / 2);
        return circle;
    }
}