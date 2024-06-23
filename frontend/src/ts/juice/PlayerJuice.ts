import {InventoryAddEvent, BeforeDeathEvent, PlaceablePlacedEvent, ControlsActionEvent} from '../Events';
import {random} from '../Utils';
import {sound} from '@pixi/sound';
import * as PIXI from 'pixi.js';
import {registerPreload} from '../Preloading';
import {BerryhunterApi} from "../backend/BerryhunterApi";

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

PlaceablePlacedEvent.subscribe((payload) => {
    switch(payload.item)
    {
        default:
            sound.play('place-heavy', {
                speed: random(0.9, 1.11),
                volume: random(0.8, 1),
            });
            break;
    }
});

ControlsActionEvent.subscribe((payload) => {
    switch (payload.actionType) {
        case BerryhunterApi.ActionType.ConsumeItem:
            sound.play('eat', {
                speed: random(0.9, 1.11),
                volume: random(0.8, 1),
            });
            break;
    }
});

PIXI.Assets.add({alias: 'collect', src: require('../../sounds/245645__unfa__cartoon-pop-clean.mp3')});
PIXI.Assets.add({alias: 'death', src: require('../../sounds/416838__tonsil5__grunt2-death-pain.mp3')});
PIXI.Assets.add({alias: 'place-heavy', src: require('../../sounds/443629__checholio__28-clavando-estaca.mp3')});
PIXI.Assets.add({alias: 'eat', src: require('../../sounds/548367__borgory__chewing-crunch.mp3')});

// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('collect'));
registerPreload(PIXI.Assets.load('death'));
registerPreload(PIXI.Assets.load('place-heavy'));
registerPreload(PIXI.Assets.load('eat'));