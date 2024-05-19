import {BasicConfig as Constants} from '../config/Basic';
import * as PIXI from 'pixi.js';


export class InjectedSVG extends PIXI.Sprite {
    constructor(svgTexture: PIXI.Texture, x, y, size, rotation?) {
        super(svgTexture);

        size = size || (Constants.GRAPHIC_BASE_SIZE / 2);
        size *= 2;

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        if (typeof size !== 'number') {
            console.warn('InjectedSVG "' + svgTexture.baseTexture.imageUrl + '" size "' + size + '" is not a number but a ' + (typeof size));
        }
        this.width = size;
        this.height = size;
        this.rotation = rotation || 0;
    }
}
