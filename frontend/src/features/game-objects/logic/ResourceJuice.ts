import { ResourceStockChangedEvent } from '../../core/logic/Events';
import * as Resources from './Resources';
import { isUndefined, random } from '../../common/logic/Utils';
import * as PIXI from 'pixi.js';
import { registerPreload } from '../../core/logic/Preloading';
import { spatialAudio } from '../../audio/logic/SpatialAudio';

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
        case Resources.MarioTree.name:
        case Resources.RoundTree.name:
            spatialAudio.play('tree-chop',
                payload.position, {
                speed: random(0.9, 1.11),
                volume: random(0.8, 1.25),
            });
            break;
        case Resources.BerryBush.name:
        case Resources.Flower.name:
            spatialAudio.play('bush-hit',
                payload.position, {
                speed: random(0.7, 0.9),
                volume: random(0.2, 0.3),
            });
            break;
        case Resources.Mineral.name:
        case Resources.Stone.name:
        case Resources.Bronze.name:
        case Resources.Iron.name:
        case Resources.Titanium.name:
            spatialAudio.play('mineral-hit-dull',
                payload.position, {
                speed: random(0.7, 1.3),
                volume: random(1, 1.25),
            });
            break;
        default:
            return;
    }
});


PIXI.Assets.add({ alias: 'tree-chop', src: require('../assets/resources/536736__egomassive__chop.mp3') });
PIXI.Assets.add({ alias: 'mineral-hit-dull', src: require('../assets/resources/319229__worthahep88__single-rock-hit-dirt-2.mp3') });
PIXI.Assets.add({ alias: 'mineral-hit-sharp', src: require('../assets/resources/390770__d00121058__fx_014_sword_contact_stone_2.mp3') });
PIXI.Assets.add({ alias: 'bush-hit', src: require('../assets/resources/637791__kyles__rock-hit-bushes-brush-land-in-leaves.mp3') });
// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('tree-chop'));
registerPreload(PIXI.Assets.load('mineral-hit-dull'));
registerPreload(PIXI.Assets.load('mineral-hit-sharp'));
registerPreload(PIXI.Assets.load('bush-hit'));
