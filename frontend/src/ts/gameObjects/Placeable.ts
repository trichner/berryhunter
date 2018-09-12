'use strict';

import * as PIXI from 'pixi.js';
import {GameObject} from '../gameObjects/_GameObject';
import {randomRotation} from '../Utils';
import {GraphicsConfig} from '../../config/Graphics';

export class Placeable extends GameObject {
    item;

    constructor(placeableItem, x, y) {
        super(placeableItem.placeable.layer,
            x, y,
            placeableItem.graphic.size,
            randomRotation(placeableItem.placeable.directions),
            placeableItem.graphic.svg);

        this.item = placeableItem;
        this.visibleOnMinimap = placeableItem.placeable.visibleOnMinimap;
    }

    is(placeableItem) {
        if (typeof placeableItem === 'string') {
            return this.item.name = placeableItem;
        }
        return this.item === placeableItem;
    }

    createMinimapIcon() {
        let shape = new PIXI.Graphics();
        let miniMapCfg = GraphicsConfig.miniMap.icons[this.item.name];
        shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
        shape.drawCircle(0, 0, this.size * miniMapCfg.sizeFactor);

        return shape;
    }
}