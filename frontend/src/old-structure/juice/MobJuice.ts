import {sound} from '@pixi/sound';
import * as PIXI from 'pixi.js';
import {registerPreload} from '../../features/core/logic/Preloading';

PIXI.Assets.add({alias: 'dodoHit', src: require('../sounds/662504__100139062__bird-gets-hit.mp3')});
PIXI.Assets.add({alias: 'mammothHit', src: require('../sounds/365134__gibarroule__cow-scream.mp3')});

// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('dodoHit'));
registerPreload(PIXI.Assets.load('mammothHit'));
