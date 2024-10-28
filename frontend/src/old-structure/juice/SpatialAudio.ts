import * as PIXI from 'pixi.js';
import { filters, PlayOptions, sound } from '@pixi/sound';
import { Vector } from '../../features/core/logic/Vector';
import { CameraUpdatedEvent, PlayerMoved } from '../../features/core/logic/Events';
import { isNumber, isUndefined } from 'lodash';

export class SpatialAudio {
    listenerPosition: Vector;
    logging: boolean = false;

    constructor() {
        CameraUpdatedEvent.subscribe((position) => {
            this.listenerPosition = position;
        })
    }

    play(soundId: string, sourcePosition: Vector, playOptions?: PlayOptions) {
        const soundInstance = sound.find(soundId);

        if (!soundInstance) return;

        if (isUndefined(this.listenerPosition) || !isNumber(this.listenerPosition.x) || !isNumber(this.listenerPosition.y))
            return;

        //TODO: Magical number. what is the actual interest range?
        const maxDistance = 700;

        const dx = sourcePosition.x - this.listenerPosition.x;
        const dy = sourcePosition.y - this.listenerPosition.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (isNaN(distance)) {
            console.warn('Distance calculation resulted in NaN, setting distance to maxDistance.');
            distance = maxDistance;
        }

        // Volume
        let volume = 1 - Math.min(distance / maxDistance, 1);
        volume = Math.max(0.1, Math.min(volume, 1));
        if (!isFinite(volume)) {
            volume = 1;
        }

        if (volume <= 0) return;

        // Pan
        let pan = dx / maxDistance;
        pan = Math.max(-1, Math.min(pan, 1));
        if (!isFinite(pan)) {
            pan = 0;
        }

        if (this.logging) {
            console.log('pos - ' + this.listenerPosition);
            console.log('sourcepos - ' + sourcePosition);
            console.log('dist - ' + distance);
            console.log('vol - ' + volume);
            console.log('pan - ' + volume);
        }

        // Play sound
        const stereoFilter = new filters.StereoFilter(pan);
        playOptions = {
            ...playOptions,
            volume: (playOptions?.volume ?? 1) * volume,
            filters: [stereoFilter]
        };
        soundInstance.play(playOptions);
    }

    setListenerPosition(x: number, y: number) {
        this.listenerPosition.set(x, y);
    }
}

export const spatialAudio = new SpatialAudio();
