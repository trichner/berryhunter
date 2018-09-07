'use strict';

import {BasicConfig as Constants} from '../config/Basic';
// TODO vendor
import * as PIXI from './PIXI';


export default function InjectedSVG(svgTexture, x, y, size, rotation) {
    size = size || (Constants.GRAPHIC_BASE_SIZE / 2);
    size *= 2;

    let sprite = new PIXI.Sprite(svgTexture);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    if (typeof size !== 'number') {
        console.warn('InjectedSVG "' + svgTexture.baseTexture.imageUrl + '" size "' + size + '" is not a number but a ' + (typeof size));
    }
    sprite.width = size;
    sprite.height = size;
    sprite.rotation = rotation || 0;

    return sprite;
}
