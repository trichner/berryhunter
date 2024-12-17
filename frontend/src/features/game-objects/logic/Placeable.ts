import {GameObject} from './_GameObject';
import {randomRotation} from '../../common/logic/Utils';
import {GraphicsConfig} from '../../../client-data/Graphics';
import {StatusEffect} from './StatusEffect';
import {PlaceablePlacedEvent} from '../../core/logic/Events';
import {Graphics} from 'pixi.js';
import {IMiniMapRendered, Layer, LevelOfDynamic} from '../../mini-map/logic/MiniMapInterfaces';

export class Placeable extends GameObject implements IMiniMapRendered {
    item;

    constructor(id: number, placeableItem, x: number, y: number) {
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
            return this.item.name === placeableItem;
        }
        return this.item === placeableItem;
    }

    createMinimapIcon() {
        const miniMapCfg = GraphicsConfig.miniMap.icons[this.item.name];
        return new Graphics()
            .circle(0, 0, this.size * miniMapCfg.sizeFactor)
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }

    get miniMapLayer(): Layer {
        return Layer.OTHER;
    }
    get miniMapDynamic(): LevelOfDynamic {
        return LevelOfDynamic.REMOVABLE_REMEMBERED;
    }

    createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape)
        };
    }
}
