import {GameObject} from './_GameObject';
import * as Preloading from '../Preloading';
import {isUndefined, random, randomInt} from '../Utils';
import {GraphicsConfig} from '../../client-data/Graphics';
import {StatusEffect} from './StatusEffect';
import {IGame} from '../interfaces/IGame';
import {GameSetupEvent} from '../Events';
import * as PIXI from 'pixi.js';

let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
    Game = game;
});

function maxSize(mob: keyof typeof GraphicsConfig.mobs) {
    return GraphicsConfig.mobs[mob].maxSize;
}

function minSize(mob: keyof typeof GraphicsConfig.mobs) {
    return GraphicsConfig.mobs[mob].minSize;
}

function file(mob: keyof typeof GraphicsConfig.mobs) {
    return GraphicsConfig.mobs[mob].file;
}

export class Mob extends GameObject {
    constructor(id: number, gameLayer: PIXI.Container, x: number, y: number, size: number, svg: PIXI.Texture) {
        super(id, gameLayer, x, y, size, 0, svg);
        this.isMovable = true;
        this.visibleOnMinimap = false;
    }

    setRotation(rotation: number) {
        if (isUndefined(rotation)) {
            return;
        }

        // Subtract the default rotation offset of all animal graphics
        super.setRotation(rotation + Math.PI / 2);
    }

    protected override createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape),
        };
    }
}

export class Dodo extends Mob {
    static svg: PIXI.Texture;

    constructor(id: number, x: number, y: number) {
        super(id, Game.layers.mobs.dodo, x, y,
            randomInt(minSize('dodo'), maxSize('dodo')),
            Dodo.svg);
    }

    protected override createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape, 
                {
                    soundId: 'dodoHit',
                    options: {
                        volume: random(0.4, 0.5),
                        speed: random(1, 1.1)
                    },
                    chanceToPlay: 0.3
                }),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape),
        };
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Dodo, file('dodo'), maxSize('dodo'));

export class SaberToothCat extends Mob {
    static svg: PIXI.Texture;

    constructor(id: number, x: number, y: number) {
        super(id, Game.layers.mobs.saberToothCat, x, y,
            randomInt(minSize('saberToothCat'), maxSize('saberToothCat')),
            SaberToothCat.svg);

    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(SaberToothCat, file('saberToothCat'), maxSize('saberToothCat'));


export class Mammoth extends Mob {
    static svg: PIXI.Texture;

    constructor(id: number, x: number, y: number) {
        super(id, Game.layers.mobs.mammoth, x, y,
            randomInt(minSize('mammoth'), maxSize('mammoth')),
            Mammoth.svg);
    }

    protected override createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape, 
                {
                    soundId: 'mammothHit',
                    options: {
                        volume: random(0.4, 0.5),
                        speed: random(1, 1.1)
                    },
                    chanceToPlay: 0.3
                }),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape),
        };
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Mammoth, file('mammoth'), maxSize('mammoth'));
