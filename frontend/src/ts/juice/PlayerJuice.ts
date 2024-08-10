import { InventoryAddEvent, BeforeDeathEvent, PlaceablePlacedEvent, ControlsActionEvent, VitalSignChangedEvent, PlayerDamagedEvent, PlayerStartedFreezingEvent } from '../Events';
import { random, randomFrom } from '../Utils';
import { sound } from '@pixi/sound';
import * as PIXI from 'pixi.js';
import { registerPreload } from '../Preloading';
import { BerryhunterApi } from "../backend/BerryhunterApi";
import { TriggerIntervalMap } from './TriggerIntervalMap';

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

    switch (payload.itemType) {
        case 'RESOURCE':
            break
        default:
            if (payload.itemName == 'Flower') break;
            sound.play('collect', {
                speed: random(0.9, 1.11),
                volume: random(0.7 * volumeModifier, 1 * volumeModifier),
            });
            break;
    }
});

PlaceablePlacedEvent.subscribe((payload) => {
    switch (payload.item) {
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

PlayerDamagedEvent.subscribe((payload) => {
    const soundId = 'hurt';
    const delayInterval = 5000;
    if (triggerMap.trigger(soundId, delayInterval)){
        const soundId2 = randomFrom(hurt);
        sound.play(soundId2, {
            speed: random(0.8, 0.9),
            volume: random(0.8, 0.9),
        });
    }
});

PlayerStartedFreezingEvent.subscribe( () => {
    const soundId = 'cold';
    const delayInterval = 3000;
    if (triggerMap.trigger(soundId, delayInterval)){
        sound.play(soundId, {
            volume: random(0.8, 0.9),
        });
    }
});

VitalSignChangedEvent.subscribe((payload) => {
    switch (payload.vitalSign) {
        case 'satiety':
            if (payload.newValue.relative <= 0){
                const soundId = 'hungry';
                const delayInterval = 5000;
                if (triggerMap.trigger(soundId, delayInterval)){
                    sound.play(soundId, {
                        speed: random(0.9, 1),
                        volume: random(0.8, 1),
                    });
                }
            }
            break;
    }
});

const triggerMap = new TriggerIntervalMap();
const hurt = ['hurt', 'hurt2', 'hurt3', 'hurt4', 'hurt5'];
    
PIXI.Assets.add({ alias: 'collect', src: require('../../sounds/245645__unfa__cartoon-pop-clean.mp3') });
PIXI.Assets.add({ alias: 'death', src: require('../../sounds/416838__tonsil5__grunt2-death-pain.mp3') });
PIXI.Assets.add({ alias: 'place-heavy', src: require('../../sounds/443629__checholio__28-clavando-estaca.mp3') });
PIXI.Assets.add({ alias: 'eat', src: require('../../sounds/548367__borgory__chewing-crunch.mp3') });
PIXI.Assets.add({ alias: 'hurt', src: require('../../sounds/413181__micahlg__male_hurt5.mp3') });
PIXI.Assets.add({ alias: 'hurt2', src: require('../../sounds/413185__micahlg__male_hurt8.mp3') });
PIXI.Assets.add({ alias: 'hurt3', src: require('../../sounds/413186__micahlg__male_hurt9.mp3') });
PIXI.Assets.add({ alias: 'hurt4', src: require('../../sounds/413175__micahlg__male_hurt10.mp3') });
PIXI.Assets.add({ alias: 'hurt5', src: require('../../sounds/413179__micahlg__male_hurt14.mp3') });
PIXI.Assets.add({ alias: 'hungry', src: require('../../sounds/447911__breviceps__growling-stomach-stomach-rumbles.mp3') });
PIXI.Assets.add({ alias: 'cold', src: require('../../sounds/685253__antonsoederberg__freeze-sound-effect-fx.mp3') });

// noinspection JSIgnoredPromiseFromCall
registerPreload(PIXI.Assets.load('collect'));
registerPreload(PIXI.Assets.load('death'));
registerPreload(PIXI.Assets.load('place-heavy'));
registerPreload(PIXI.Assets.load('eat'));
registerPreload(PIXI.Assets.load('hurt'));
registerPreload(PIXI.Assets.load('hurt2'));
registerPreload(PIXI.Assets.load('hurt3'));
registerPreload(PIXI.Assets.load('hurt4'));
registerPreload(PIXI.Assets.load('hurt5'));
registerPreload(PIXI.Assets.load('hungry'));
registerPreload(PIXI.Assets.load('cold'));

