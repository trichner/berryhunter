import {
    InventoryAddEvent,
    BeforeDeathEvent,
    PlaceablePlacedEvent,
    ControlsActionEvent,
    VitalSignChangedEvent,
    PlayerDamagedEvent,
    PlayerStartedFreezingEvent,
    PlayerCraftingStateChangedEvent,
    PlayerMoved,
    CharacterMoved,
    GameJoinEvent
} from '../../core/logic/Events';
import { random, randomFrom } from '../../common/logic/Utils';
import { sound } from '@pixi/sound';
import * as PIXI from 'pixi.js';
import { registerPreload } from '../../core/logic/Preloading';
import { BerryhunterApi } from "../../backend/logic/BerryhunterApi";
import { TriggerIntervalMap } from '../../audio/logic/TriggerIntervalMap';
import { spatialAudio } from '../../audio/logic/SpatialAudio';
import {GraphicsConfig} from '../../../client-data/Graphics';

/*
 * TODO this file should be split across Character, VitalSigns, potentially more
 */

BeforeDeathEvent.subscribe((payload) => {
    if (payload?.player?.character) {
        spatialAudio.play('death',
            payload.player.character.getPosition(),
            {
                speed: random(0.9, 1.11),
                volume: random(0.7, 1),
            });
    }
    else {
        sound.play('death',
            {
                speed: random(0.9, 1.11),
                volume: random(0.7, 1),
            });
    }
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
                volume: random(0.7 * volumeModifier, volumeModifier),
            });
            break;
    }
});

PlaceablePlacedEvent.subscribe((payload) => {
    switch (payload.item) {
        default:
            spatialAudio.play('place-heavy',
                payload.getPosition(),
                {
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
    if (triggerMap.trigger(soundId, delayInterval)) {
        const randomSoundId = randomFrom(hurt);
        spatialAudio.play(randomSoundId,
            payload.player.character.getPosition(),
            {
                speed: random(0.8, 0.9),
                volume: random(0.8, 0.9),
            });
    }
});

PlayerStartedFreezingEvent.subscribe(() => {
    const soundId = 'cold';
    const delayInterval = 3000;
    if (triggerMap.trigger(soundId, delayInterval)) {
        sound.play(soundId, {
            volume: random(0.7, 0.8),
        });
    }
});

PlayerMoved.subscribe((position) => {
    const soundId = 'step';
    const delayInterval = 400;
    if (triggerMap.trigger(soundId, delayInterval)) {
        const randomSoundId = randomFrom(steps);
        spatialAudio.play(randomSoundId, position, { volume: 0.9 });
    }
});

CharacterMoved.subscribe((position) => {
    const soundId = 'step';
    const delayInterval = 400;
    if (triggerMap.trigger(soundId, delayInterval)) {
        const randomSoundId = randomFrom(steps);
        spatialAudio.play(randomSoundId, position, { volume: 0.9 });
    }
});

GameJoinEvent.subscribe((player) => {
    //const soundId = 'hello';
    //sound.play(soundId, { volume: 0.9 });
})

VitalSignChangedEvent.subscribe((payload) => {
    switch (payload.vitalSign) {
        case 'satiety':
            if (payload.newValue.relative < GraphicsConfig.vitalSigns.overlayThreshold) {
                const soundId = 'hungry';
                const delayInterval = 5000;
                if (triggerMap.trigger(soundId, delayInterval)) {
                    sound.play(soundId, {
                        speed: random(0.9, 1),
                        volume: random(0.8, 1),
                    });
                }
            }
            break;
    }
});

PlayerCraftingStateChangedEvent.subscribe((isCrafting) => {
    const soundId = 'loopCrafting';
    const soundToPlay = sound.find(soundId);

    if (isCrafting) {
        if (soundToPlay.isPlaying) return;
        sound.play(soundId, {
            volume: random(0.8, 0.9),
            loop: true
        });
    }
    else {
        soundToPlay.stop();
    }
});

const triggerMap = new TriggerIntervalMap();
const hurt = ['hurt', 'hurt2', 'hurt3', 'hurt4', 'hurt5'];
export const swingLightAudioCues = ['swingLight', 'swingLight2', 'swingLight3', 'swingLight4', 'swingHeavy', 'swingHeavy2'];
const steps = ['step', 'step2', 'step3'];

PIXI.Assets.add({ alias: 'collect', src: require('../assets/245645__unfa__cartoon-pop-clean.mp3') });
PIXI.Assets.add({ alias: 'death', src: require('../assets/416838__tonsil5__grunt2-death-pain.mp3') });
PIXI.Assets.add({ alias: 'place-heavy', src: require('../assets/443629__checholio__28-clavando-estaca.mp3') });
PIXI.Assets.add({ alias: 'eat', src: require('../assets/548367__borgory__chewing-crunch.mp3') });
PIXI.Assets.add({ alias: 'hurt', src: require('../assets/413181__micahlg__male_hurt5.mp3') });
PIXI.Assets.add({ alias: 'hurt2', src: require('../assets/413185__micahlg__male_hurt8.mp3') });
PIXI.Assets.add({ alias: 'hurt3', src: require('../assets/413186__micahlg__male_hurt9.mp3') });
PIXI.Assets.add({ alias: 'hurt4', src: require('../assets/413175__micahlg__male_hurt10.mp3') });
PIXI.Assets.add({ alias: 'hurt5', src: require('../assets/413179__micahlg__male_hurt14.mp3') });
PIXI.Assets.add({ alias: 'hungry', src: require('../assets/447911__breviceps__growling-stomach-stomach-rumbles.mp3') });
PIXI.Assets.add({ alias: 'cold', src: require('../assets/685253__antonsoederberg__freeze-sound-effect-fx.mp3') });
PIXI.Assets.add({ alias: 'loopCrafting', src: require('../assets/399585__wolffvisuals__workbench-tailoring.mp3') });
PIXI.Assets.add({ alias: 'step', src: require('../assets/750798__simonjeffery13__footsteps-on-road.mp3') });
PIXI.Assets.add({ alias: 'step2', src: require('../assets/750798__simonjeffery13__footsteps-on-road2.mp3') });
PIXI.Assets.add({ alias: 'step3', src: require('../assets/750798__simonjeffery13__footsteps-on-road3.mp3') });

PIXI.Assets.add({ alias: 'swingLight', src: require('../assets/542000__rob_marion__gasp_swing_light_1.mp3') });
PIXI.Assets.add({ alias: 'swingLight2', src: require('../assets/542001__rob_marion__gasp_swing_light_2.mp3') });
PIXI.Assets.add({ alias: 'swingLight3', src: require('../assets/542002__rob_marion__gasp_swing_light_3.mp3') });
PIXI.Assets.add({ alias: 'swingLight4', src: require('../assets/542019__rob_marion__gasp_swing_light_4.mp3') });
PIXI.Assets.add({ alias: 'swingHeavy', src: require('../assets/541996__rob_marion__gasp_swing_heavy_1.mp3') });
PIXI.Assets.add({ alias: 'swingHeavy2', src: require('../assets/541994__rob_marion__gasp_swing_heavy_2.mp3') });

PIXI.Assets.add({ alias: 'hello', src: require('../assets/411184__d3rfux__gruzi.mp3') });

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
registerPreload(PIXI.Assets.load('step'));
registerPreload(PIXI.Assets.load('step2'));
registerPreload(PIXI.Assets.load('step3'));
registerPreload(PIXI.Assets.load('loopCrafting'));

registerPreload(PIXI.Assets.load('swingLight'));
registerPreload(PIXI.Assets.load('swingLight2'));
registerPreload(PIXI.Assets.load('swingLight3'));
registerPreload(PIXI.Assets.load('swingLight4'));
registerPreload(PIXI.Assets.load('swingHeavy'));
registerPreload(PIXI.Assets.load('swingHeavy2'));

registerPreload(PIXI.Assets.load('hello'));
