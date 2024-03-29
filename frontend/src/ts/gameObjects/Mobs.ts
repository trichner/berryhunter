'use strict';

import {GameObject} from './_GameObject';
import * as Preloading from '../Preloading';
import {isUndefined, randomInt} from '../Utils';
import {GraphicsConfig} from '../../config/Graphics';
import {StatusEffect} from './StatusEffect';
import {IGame} from "../interfaces/IGame";
import {GameSetupEvent} from "../Events";
import * as PIXI from "pixi.js";

let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
    Game = game;
});

function maxSize(mob) {
    return GraphicsConfig.mobs[mob].maxSize;
}

function minSize(mob) {
    return GraphicsConfig.mobs[mob].minSize;
}

function file(mob) {
    return GraphicsConfig.mobs[mob].file;
}

export class Mob extends GameObject {
    constructor(id: number, gameLayer, x, y, size, svg: PIXI.Texture) {
        super(id, gameLayer, x, y, size, 0, svg);
        this.isMoveable = true;
        this.visibleOnMinimap = false;
    }

    setRotation(rotation) {
        if (isUndefined(rotation)) {
            return;
        }

        // Subtract the default rotation offset of all animal graphics
        GameObject.prototype.setRotation.call(this, rotation + Math.PI / 2);
    }

    createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape)
        }
    }
}

export class Dodo extends Mob {
    static svg: PIXI.Texture;

    constructor(id: number, x, y) {
        super(id, Game.layers.mobs.dodo, x, y,
            randomInt(minSize("dodo"), maxSize("dodo")),
            Dodo.svg);
    }
}

Preloading.registerGameObjectSVG(Dodo, file("dodo"), maxSize("dodo"));

export class SaberToothCat extends Mob {
    static svg: PIXI.Texture;

    constructor(id: number, x, y) {
        super(id, Game.layers.mobs.saberToothCat, x, y,
            randomInt(minSize("saberToothCat"), maxSize("saberToothCat")),
            SaberToothCat.svg);

    }
}

Preloading.registerGameObjectSVG(SaberToothCat, file("saberToothCat"), maxSize("saberToothCat"));


export class Mammoth extends Mob {
    static svg: PIXI.Texture;

    constructor(id: number, x, y) {
        super(id, Game.layers.mobs.mammoth, x, y,
            randomInt(minSize("mammoth"), maxSize("mammoth")),
            Mammoth.svg);
    }
}

Preloading.registerGameObjectSVG(Mammoth, file("mammoth"), maxSize("mammoth"));
