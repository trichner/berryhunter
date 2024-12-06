import {sound} from '@pixi/sound';
import * as PIXI from 'pixi.js';
import {registerPreload} from '../../core/logic/Preloading';

PIXI.Assets.add({alias: 'mobHit', src: require('../assets/mobs/348241__newagesoup__punch-boxing-04.mp3')});
PIXI.Assets.add({alias: 'dodoHit', src: require('../assets/mobs/662504__100139062__bird-gets-hit.mp3')});
PIXI.Assets.add({alias: 'mammothHit', src: require('../assets/mobs/365134__gibarroule__cow-scream.mp3')});
PIXI.Assets.add({alias: 'saberToothCatHit', src: require('../assets/mobs/389708__suspensiondigital__large-angry-cats.mp3')});
PIXI.Assets.add({alias: 'titanium-shard-hit', src: require('../assets/mobs/760566__noisyredfox__pickaxe2.mp3')});


// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('mobHit'));
registerPreload(PIXI.Assets.load('dodoHit'));
registerPreload(PIXI.Assets.load('mammothHit'));
registerPreload(PIXI.Assets.load('saberToothCatHit'));
registerPreload(PIXI.Assets.load('titanium-shard-hit'));
