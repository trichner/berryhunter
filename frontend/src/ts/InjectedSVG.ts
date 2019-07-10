'use strict';

import {BasicConfig as Constants} from '../config/Basic';
import * as PIXI from 'pixi.js';


export class InjectedSVG extends PIXI.Sprite {
    constructor(svgTexture, x, y, size, rotation?) {
        super(svgTexture);

        size = size || (Constants.GRAPHIC_BASE_SIZE / 2);
        size *= 2;

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        if (typeof size !== 'number') {
            console.warn('InjectedSVG "' + svgTexture.baseTexture.imageUrl + '" size "' + size + '" is not a number but a ' + (typeof size));
        }
        if (this.width == 300) {
            this.width = size * 1.5;
        } else {
            this.width = size;
        }

        if (this.height == 150) {
            this.height = size / 2 * 1.5;
        } else {
            this.height = size;
        }
        this.rotation = rotation || 0;
    }
}
