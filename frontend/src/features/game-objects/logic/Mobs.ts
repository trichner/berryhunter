import {IVector} from "../../core/logic/Vector";
import {GameObject} from './_GameObject';
import * as Preloading from '../../core/logic/Preloading';
import {isUndefined, random, randomInt} from '../../common/logic/Utils';
import {GraphicsConfig} from '../../../client-data/Graphics';
import {StatusEffect} from './StatusEffect';
import {IGame} from '../../core/logic/IGame';
import {GameSetupEvent} from '../../core/logic/Events';
import * as PIXI from 'pixi.js';
import './MobJuice';

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

function anchor(mob: keyof typeof GraphicsConfig.mobs) {
    return GraphicsConfig.mobs[mob].anchor;
}

function file(mob: keyof typeof GraphicsConfig.mobs) {
    return GraphicsConfig.mobs[mob].file;
}

export abstract class Mob extends GameObject {
    protected constructor(
        id: number,
        gameLayer: PIXI.Container,
        x: number,
        y: number,
        size: number,
        svg: PIXI.Texture,
        anchor?: IVector
    ) {
        super(id, gameLayer, x, y, size, 0, svg, anchor);
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
                [{
                    soundId: 'dodoHit',
                    options: {
                        volume: random(0.4, 0.5),
                        speed: random(1, 1.1),
                    },
                    chanceToPlay: 0.3,
                }]),
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

    protected override createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape,
                [{
                    soundId: 'saberToothCatHit',
                    options: {
                        volume: random(0.4, 0.5),
                        speed: random(0.9, 1),
                    },
                    chanceToPlay: 0.3,
                }]),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape),
        };
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(SaberToothCat, file('saberToothCat'), maxSize('saberToothCat'));


export class Mammoth extends Mob {
    static svg: PIXI.Texture;

    constructor(id: number, x: number, y: number) {
        super(id, Game.layers.mobs.mammoth, x, y,
            randomInt(minSize('mammoth'), maxSize('mammoth')),
            Mammoth.svg, anchor('mammoth'));
    }

    protected override createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape,
                [{
                    soundId: 'mammothHit',
                    options: {
                        volume: random(0.4, 0.5),
                        speed: random(1, 1.1),
                    },
                    chanceToPlay: 0.3,
                }]),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape),
        };
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Mammoth, file('mammoth'), maxSize('mammoth'));

export class AngryMammoth extends Mob {
    static svg: PIXI.Texture;

    constructor(id: number, x: number, y: number) {
        super(id, Game.layers.bossMobs, x, y,
            randomInt(minSize('angryMammoth'), maxSize('angryMammoth')),
            AngryMammoth.svg, anchor('angryMammoth'));
    }

    protected override createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape,
                [{
                    soundId: 'mammothHit',
                    options: {
                        volume: random(0.6, 0.7),
                        speed: random(0.4, 0.5),
                    },
                    chanceToPlay: 0.3,
                }]),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape),
        };
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(AngryMammoth, file('angryMammoth'), maxSize('angryMammoth'));
