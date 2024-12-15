import {Container, Graphics, Sprite, Texture} from 'pixi.js';
import {GameObject} from './_GameObject';
import * as Preloading from '../../core/logic/Preloading';
import {deg2rad, isDefined, random, randomInt, randomRotation, TwoDimensional} from '../../common/logic/Utils';
import {createInjectedSVG} from '../../core/logic/InjectedSVG';
import {GraphicsConfig} from '../../../client-data/Graphics';
import {IGame} from '../../core/logic/IGame';
import {GameSetupEvent, ResourceStockChangedEvent} from '../../core/logic/Events';
import {alea as SeedRandom} from 'seedrandom';
import {StatusEffect, StatusEffectDefinition} from './StatusEffect';
import {ISvgContainer} from '../../core/logic/ISvgContainer';
import './ResourceJuice';
import * as PIXI from 'pixi.js';

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
        svg: Texture,
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
            position: this.getPosition(),
        });
        let scale = newStock / this.capacity;
        this.shape.scale.set(this.baseScale * scale);
    }

    createStatusEffects() {
        return {
            Damaged: StatusEffect.forDamaged(this.shape),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.shape),
            Yielded: StatusEffect.forYielded(this.shape),
        };
    }

    protected logStatusChange(newStatusEffects: StatusEffectDefinition[]): void {
        if (!Array.isArray(newStatusEffects) || newStatusEffects.length === 0) {
            console.log('nothing');
        } else {
            newStatusEffects.forEach((effect: StatusEffectDefinition) => {
                console.log(effect.id);
            });
        }
    }
}

export class Tree extends Resource {
    static resourceSpot: ISvgContainer = {svg: undefined};
    resourceSpotTexture: Sprite;

    constructor(id: number, x: number, y: number, size: number, svg: Texture) {
        super(id, Game.layers.resources.trees, x, y, size * 1.8 + GraphicsConfig.character.size, 0, svg);

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
    static resourceSpot: ISvgContainer = {svg: undefined};
    resourceSpotTexture: Sprite;

    constructor(id: number, x: number, y: number, size: number, svg: Texture, applyVisualPadding: boolean = true) {
        super(id, Game.layers.resources.minerals, x, y,
            applyVisualPadding ? size * 1.1 + GraphicsConfig.character.size : size, // Add some space so the character can get visually close to the collider
            0, // Due to the shadow in the mineral graphics, those should not be randomly rotated
            svg);

        this.resourceSpotTexture = createInjectedSVG(Mineral.resourceSpot.svg, x, y, this.getResourceSpotSize(), this.rotation);
        Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
    }

    protected getResourceSpotSize() {
        return this.size * 0.7;
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
        this.visibleOnMinimap = false;
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

export class TitaniumShard extends Mineral {
    static svg: PIXI.Texture;

    constructor(id: number, x: number, y: number, size: number) {
        super(id, x, y, size - (GraphicsConfig.character.size * 0.5), TitaniumShard.svg);
    }

    protected getResourceSpotSize() {
        return this.size * 0.9;
    }

    createMinimapIcon() {
        const miniMapCfg = GraphicsConfig.miniMap.icons.titaniumShard;
        return new Graphics()
            .poly(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 3, true))
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(TitaniumShard, mineralCfg.titaniumShardFile, mineralCfg.shardMaxSize);


let berryBushCfg = GraphicsConfig.resources.berryBush;

export class BerryBush extends Resource {
    static svg: Texture;
    static berry: ISvgContainer = {svg: undefined};
    // It's the little black cross on top of berries
    static calyx: ISvgContainer = {svg: undefined};

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

    onStockChange(newStock: number, oldStock: number) {
        if (isDefined(this.berries)) {
            this.berries.parent.removeChild(this.berries);
        }

        this.berries = new Container();
        this.shape.addChild(this.berries);

        // Seed a random generator with the ID of the game object to make sure it always looks the same
        let seedRandom = new SeedRandom(this.id);

        for (let i = 0; i < this.capacity; i++) {
            if (i >= newStock) {
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
        ResourceStockChangedEvent.trigger({
            entityType: this.constructor.name,
            newStock: newStock,
            oldStock: oldStock,
            position: this.getPosition(),
        });
    }

    random(rng: () => number, min: number, max: number) {
        return rng() * (max - min) + min;
    }
}

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(BerryBush, berryBushCfg.bushFile, berryBushCfg.maxSize);
// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(BerryBush.berry, berryBushCfg.berryFile, berryBushCfg.berryMaxSize);
// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(BerryBush.calyx, berryBushCfg.calyxFile, berryBushCfg.berryMaxSize);

export class Flower extends Resource {
    static resourceSpot = {
        svg: null as Texture,
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
