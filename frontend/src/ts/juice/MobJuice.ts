import {sound} from '@pixi/sound';
import * as PIXI from 'pixi.js';
import {registerPreload} from '../Preloading';

PIXI.Assets.add({alias: 'dodoHit', src: require('../../sounds/662504__100139062__bird-gets-hit.mp3')});

// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('dodoHit'));
