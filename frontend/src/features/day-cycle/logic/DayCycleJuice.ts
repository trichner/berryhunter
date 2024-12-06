import {OnDayTimeStartEvent, OnNightTimeStartEvent} from '../../core/logic/Events';
import {sound} from '@pixi/sound';
import * as PIXI from 'pixi.js';
import {registerPreload} from '../../core/logic/Preloading';

OnDayTimeStartEvent.subscribe(() => {
    sound.play('rooster', {
        volume: 0.5
    });
});

OnNightTimeStartEvent.subscribe(() => {
    sound.play('wolf', {
        volume: 0.5
    });
});

PIXI.Assets.add({alias: 'rooster', src: require('../assets/435507__benjaminnelan__rooster-crow-2.mp3')});
PIXI.Assets.add({alias: 'wolf', src: require('../assets/398430__naturestemper__wolf-howl.mp3')});

// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('rooster'));
registerPreload(PIXI.Assets.load('wolf'));
