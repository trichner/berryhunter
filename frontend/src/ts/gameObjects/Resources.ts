import {Container, Graphics, Sprite, Texture} from 'pixi.js';
import {GameObject} from './_GameObject';
import * as Preloading from '../Preloading';
import {deg2rad, isDefined, randomRotation, TwoDimensional} from '../Utils';
import {createInjectedSVG} from '../InjectedSVG';
import {GraphicsConfig} from '../../config/Graphics';
import {IGame} from "../interfaces/IGame";
import {GameSetupEvent, ResourceStockChangedEvent} from '../Events';
import {alea as SeedRandom} from "seedrandom";
import { StatusEffect, StatusEffectDefinition } from './StatusEffect';
import {Emitter, upgradeConfig} from '@pixi/particle-emitter';
import { Container as DContainter } from '@pixi/display';


let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
    Game = game;
});

export class Resource extends GameObject {
    capacity: number;
    baseScale: number;
    private _stock: number;

    constructor(
        id: number, 
        gameLayer: Container,
        x: number,
        y: number,
        size: number,
        rotation: number,
        svg: Texture
    ) {
        super(id, gameLayer, x, y, size, rotation, svg);

        this.baseScale = this.shape.scale.x;
    }

    get stock() {
        return this._stock;
    }

    set stock(newStock: number) {
        if (this._stock !== newStock) {
            this.onStockChange(newStock, this._stock);
            this._stock = newStock;
        }
    }

    /**
     * @param newStock
     * @param oldStock
     * @protected
     */
    protected onStockChange(newStock: number, oldStock: number) {
        ResourceStockChangedEvent.trigger({
            entityType: this.constructor.name,
            newStock: newStock,
            oldStock: oldStock,
        });
        let scale = newStock / this.capacity;
        this.shape.scale.set(this.baseScale * scale);
    }

    createStatusEffects() {
        return {
            Yielded: StatusEffect.forYielded(this.shape)
        };
    }

    protected logStatusChange(newStatusEffects: StatusEffectDefinition[]): void {
        if (!Array.isArray(newStatusEffects) || newStatusEffects.length === 0) {
            console.log("nothing");
        } else {
            newStatusEffects.forEach((effect: StatusEffectDefinition) => {
                console.log(effect.id);
            });
        }
    }
}

const particleAssets = {
    leave: {
        svg: null as Texture,
    }
};
Preloading.registerGameObjectSVG(particleAssets.leave, GraphicsConfig.resources.tree.leaveParticleFile, 5);

export class Tree extends Resource {
    static resourceSpot: { svg: Texture } = {svg: undefined};
    resourceSpotTexture: Sprite;
    private static emitter: Emitter = null;

    constructor(id: number, x: number, y: number, size: number, svg: Texture) {
        super(id, Game.layers.resources.trees, x, y, size * 1.8 + GraphicsConfig.character.size, 0, svg);

        if (Tree.emitter === null) {
            Tree.emitter = new Emitter(Game.layers.resources.trees as unknown as DContainter, upgradeConfig(require('./tree-particles.json'), [particleAssets.leave.svg]));
        }
        this.resourceSpotTexture = createInjectedSVG(Tree.resourceSpot.svg, x, y, this.size * 0.7, randomRotation());
        Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
    }

    createMinimapIcon() {
        const miniMapCfg = GraphicsConfig.miniMap.icons.tree;
        return new Graphics()
            .circle(0, 0, this.size * miniMapCfg.sizeFactor)
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }

    hide() {
        this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
        super.hide();
    }

    protected onStockChange(newStock: number, oldStock: number) {
        super.onStockChange(newStock, oldStock);
        Tree.emitter.updateOwnerPos(this.getX(), this.getY());
        Tree.emitter.emitNow();
    }
}

let treeCfg = GraphicsConfig.resources.tree;
// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Tree.resourceSpot, treeCfg.spotFile, treeCfg.maxSize);

export class RoundTree extends Tree {
    static svg: Texture;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, x, y, size, RoundTree.svg);
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(RoundTree, treeCfg.roundTreeFile, treeCfg.maxSize);

export class MarioTree extends Tree {
    static svg: Texture;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, x, y, size, MarioTree.svg);
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(MarioTree, treeCfg.deciduousTreeFile, treeCfg.maxSize);

export class Mineral extends Resource {
    static resourceSpot: { svg: Texture } = {svg: undefined};
    resourceSpotTexture: Sprite;

    constructor(id: number, x: number, y: number, size: number, svg: Texture) {
        // Due to the shadow in the mineral graphics, those should not be randomly rotated
        super(id, Game.layers.resources.minerals, x, y, size * 1.1 + GraphicsConfig.character.size, 0, svg);

        this.resourceSpotTexture = createInjectedSVG(Mineral.resourceSpot.svg, x, y, this.size * 0.7, this.rotation);
        Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
    }

    hide() {
        this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
        super.hide();
    }
}

let mineralCfg = GraphicsConfig.resources.mineral;
// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Mineral.resourceSpot, mineralCfg.spotFile, mineralCfg.maxSize);

export class Stone extends Mineral {
    static svg: Texture;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, x, y, size, Stone.svg);
    }

    createMinimapIcon() {
        const miniMapCfg = GraphicsConfig.miniMap.icons.stone;
        return new Graphics()
            .poly(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 6, true))
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Stone, mineralCfg.stoneFile, mineralCfg.maxSize);

export class Bronze extends Mineral {
    static svg: Texture;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, x, y, size, Bronze.svg);
    }

    createMinimapIcon() {
        const miniMapCfg = GraphicsConfig.miniMap.icons.bronze;
        return new Graphics()
            .poly(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 5, true))
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Bronze, mineralCfg.bronzeFile, mineralCfg.maxSize);

export class Iron extends Mineral {
    static svg: Texture;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, x, y, size, Iron.svg);
    }

    createMinimapIcon() {
        const miniMapCfg = GraphicsConfig.miniMap.icons.iron;
        return new Graphics()
            .poly(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 6, true))
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Iron, mineralCfg.ironFile, mineralCfg.maxSize);

export class Titanium extends Mineral {
    static svg: Texture;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, x, y, size, Titanium.svg);
    }

    createMinimapIcon() {
        const miniMapCfg = GraphicsConfig.miniMap.icons.titanium;
        return new Graphics()
            .poly(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 4, true))
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Titanium, mineralCfg.titaniumFile, mineralCfg.maxSize);

let berryBushCfg = GraphicsConfig.resources.berryBush;

export class BerryBush extends Resource {
    static svg: Texture;
    static berry: { svg: Texture } = {svg: undefined};
    // It's the little black cross on top of berries
    static calyx: { svg: Texture } = {svg: undefined};

    actualShape: Container;
    berries: Container;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, Game.layers.resources.berryBush, x, y, size, 0, BerryBush.svg);
    }

    initShape(svg: Texture, x: number, y: number, size: number, rotation: number) {
        let group = new Container();
        group.position.set(x, y);

        this.actualShape = super.initShape(svg, 0, 0, size, rotation);
        group.addChild(this.actualShape);

        return group;
    }

    createMinimapIcon() {
        const miniMapCfg = GraphicsConfig.miniMap.icons.berryBush;
        return new Graphics()
            .circle(0, 0, this.size * miniMapCfg.sizeFactor)
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }

    onStockChange(newNumberOfBerries: number) {
        if (isDefined(this.berries)) {
            this.berries.parent.removeChild(this.berries);
        }

        this.berries = new Container();
        this.shape.addChild(this.berries);

        // Seed a random generator with the ID of the game object to make sure it always looks the same
        let seedRandom = new SeedRandom(this.id);

        for (let i = 0; i < this.capacity; i++) {
            if (i >= newNumberOfBerries) {
                break;
            }

            let berrySize = this.random(seedRandom, berryBushCfg.berryMinSize, berryBushCfg.berryMaxSize);

            let distance = this.random(seedRandom, 0.2, 0.4) * this.size;
            let x = Math.cos(Math.PI * 2 / this.capacity * i) * distance;
            let y = Math.sin(Math.PI * 2 / this.capacity * i) * distance;
            let berry = createInjectedSVG(BerryBush.berry.svg, x, y, berrySize);
            this.berries.addChild(berry);

            let calyx = createInjectedSVG(BerryBush.calyx.svg, x, y, berrySize, this.random(seedRandom, deg2rad(-65), deg2rad(220)));
            this.berries.addChild(calyx);
        }
    }

    random(rng: () => number, min: number, max: number) {
        return rng() * (max - min) + min;
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(BerryBush, berryBushCfg.bushfile, berryBushCfg.maxSize);
// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(BerryBush.berry, berryBushCfg.berryFile, berryBushCfg.berryMaxSize);
// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(BerryBush.calyx, berryBushCfg.calyxFile, berryBushCfg.berryMaxSize);

export class Flower extends Resource {
    static resourceSpot = {
        svg: null as Texture
    };
    resourceSpotTexture: Sprite;

    static svg: Texture;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, Game.layers.resources.berryBush, x, y, size, randomRotation(), Flower.svg);
        this.visibleOnMinimap = false;

        this.resourceSpotTexture = createInjectedSVG(Flower.resourceSpot.svg, x, y, this.size * 1.667, randomRotation());
        Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
    }

    hide() {
        this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
        super.hide();
    }
}

let flowerCfg = GraphicsConfig.resources.flower;
// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Flower.resourceSpot, flowerCfg.spotFile, flowerCfg.maxSize);
// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(Flower, flowerCfg.file, flowerCfg.maxSize);
