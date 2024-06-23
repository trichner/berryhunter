import {ResourceStockChangedEvent} from '../Events';
import * as Resources from '../gameObjects/Resources';
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

    console.log(payload.entityType);

    switch (payload.entityType) {
        case Resources.MarioTree.name:
        case Resources.RoundTree.name:
            sound.play('tree-chop', {
                speed: random(0.9, 1.11),
                volume: random(0.8, 1.25),
            });
            break;
        case Resources.BerryBush.name:
        case Resources.Flower.name:
                sound.play('bush-hit', {
                    speed: random(0.7, 0.9),
                    volume: random(0.2, 0.3),
                });
                break;
        case Resources.Mineral.name:
        case Resources.Stone.name:
        case Resources.Bronze.name:
        case Resources.Iron.name:
        case Resources.Titanium.name:
            sound.play('mineral-hit-dull', {
                speed: random(0.7, 1.3),
                volume: random(1, 1.25),
            });
            break;
        default:
            return;
    }
});


PIXI.Assets.add({alias: 'tree-chop', src: require('../../sounds/536736__egomassive__chop.mp3')});
PIXI.Assets.add({alias: 'mineral-hit-dull', src: require('../../sounds/319229__worthahep88__single-rock-hit-dirt-2.mp3')});
PIXI.Assets.add({alias: 'mineral-hit-sharp', src: require('../../sounds/390770__d00121058__fx_014_sword_contact_stone_2.mp3')});
PIXI.Assets.add({alias: 'bush-hit', src: require('../../sounds/637791__kyles__rock-hit-bushes-brush-land-in-leaves.mp3')});
// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('tree-chop'));
registerPreload(PIXI.Assets.load('mineral-hit-dull'));
registerPreload(PIXI.Assets.load('mineral-hit-sharp'));
registerPreload(PIXI.Assets.load('bush-hit'));
