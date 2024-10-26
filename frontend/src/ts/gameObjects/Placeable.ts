import * as PIXI from 'pixi.js';
import {GameObject} from './_GameObject';
import {randomRotation} from '../Utils';
import {GraphicsConfig} from '../../client-data/Graphics';
import {StatusEffect} from "./StatusEffect";
import {PlaceablePlacedEvent} from '../Events';

export class Placeable extends GameObject {
    item;

    constructor(id: number, placeableItem, x, y) {
        super(id, placeableItem.placeable.layer,
            x, y,
            placeableItem.graphic.size,
            randomRotation(placeableItem.placeable.directions),
            placeableItem.graphic.svg);

        this.item = placeableItem;
        this.visibleOnMinimap = placeableItem.placeable.visibleOnMinimap;
        PlaceablePlacedEvent.trigger(this);
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

    createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape)
        }
    }
}
