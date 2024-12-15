import {BasicConfig as Constants} from '../../../client-data/BasicConfig';
import * as PIXI from 'pixi.js';
import {isDefined} from "../../common/logic/Utils";
import {IVector} from "./Vector";


export function createInjectedSVG(
    svgTexture: PIXI.Texture,
    x: number, y: number,
    size: number = (Constants.GRAPHIC_BASE_SIZE / 2),
    rotation: number = 0,
    anchor?: IVector
): PIXI.Sprite {
    const sprite = new PIXI.Sprite(svgTexture);

    if (isDefined(anchor)) {
        sprite.anchor.set(anchor.x, anchor.y);
    } else {
        sprite.anchor.set(0.5, 0.5);
    }
    sprite.x = x;
    sprite.y = y;
    size *= 2;
    sprite.width = size;
    sprite.height = size;
    sprite.rotation = rotation;

    return sprite;
}
