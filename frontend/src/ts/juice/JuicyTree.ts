import {ResourceStockChangedEvent} from '../Events';
import {MarioTree, RoundTree} from '../gameObjects/Resources';
import {isUndefined, random} from '../Utils';
import {sound} from '@pixi/sound';
import * as PIXI from 'pixi.js';
import {registerPreload} from '../Preloading';

ResourceStockChangedEvent.subscribe((payload) => {
    if (isUndefined(payload.oldStock)) {
        // Object was just placed
        return;
    }

    if (payload.newStock >= payload.oldStock) {
        // Tree is growing
        return;
    }

    switch (payload.entityType) {
        case MarioTree.name:
        case RoundTree.name:
            sound.play('tree-chop', {
                speed: random(0.9, 1.11),
                volume: random(0.8, 1.25),
            });
            break;
        default:
            return;
    }
});


PIXI.Assets.add({alias: 'tree-chop', src: require('../../sounds/536736__egomassive__chop.mp3')});
// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('tree-chop'));
