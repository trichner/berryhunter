import {InventoryAddEvent, BeforeDeathEvent} from '../Events';
import {random} from '../Utils';
import {sound} from '@pixi/sound';
import * as PIXI from 'pixi.js';
import {registerPreload} from '../Preloading';

BeforeDeathEvent.subscribe((payload) => {
        sound.play('death', {
            speed: random(0.9, 1.11),
            volume: random(0.7, 1),
        });
});

InventoryAddEvent.subscribe((payload) => {
    const value = Math.max(1, Math.min(10, payload.change));
    const t = (value - 1) / (10 - 1);
    const volumeModifier = 0.5 + t * (1.5 - 0.5);

    sound.play('collect', {
        speed: random(0.9, 1.11),
        volume: random(0.7 * volumeModifier, 1 * volumeModifier),
    });
});

PIXI.Assets.add({alias: 'collect', src: require('../../sounds/245645__unfa__cartoon-pop-clean.mp3')});
PIXI.Assets.add({alias: 'death', src: require('../../sounds/416838__tonsil5__grunt2-death-pain.mp3')});

// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('collect'));
registerPreload(PIXI.Assets.load('death'));