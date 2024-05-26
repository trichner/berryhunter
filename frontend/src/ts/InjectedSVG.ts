import {BasicConfig as Constants} from '../config/Basic';
import * as PIXI from 'pixi.js';


export function createInjectedSVG(svgTexture: PIXI.Texture, x: number, y: number, size: number = (Constants.GRAPHIC_BASE_SIZE / 2), rotation: number = 0): PIXI.Sprite{
    const sprite = new PIXI.Sprite(svgTexture);

    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    size *= 2;
    sprite.width = size;
    sprite.height = size;
    sprite.rotation = rotation;

    return sprite;
}
