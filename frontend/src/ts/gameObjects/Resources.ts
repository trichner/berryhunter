'use strict';

import * as Game from '../Game';
import GameObject from './_GameObject';
import * as Preloading from '../Preloading';
import {isDefined, randomRotation, TwoDimensional} from '../Utils';
import InjectedSVG from '../InjectedSVG';
import {GraphicsConfig} from '../../config/Graphics';
import * as PIXI from 'pixi.js';

export default class Resource extends GameObject {
    capacity: number;
    baseScale: number;
    private _stock;

    constructor(gameLayer, x, y, size, rotation, svg) {
        super(gameLayer, x, y, size, rotation, svg);

        this.baseScale = this.shape.scale.x;
    }

    get stock() {
        return this._stock;
    }

    set stock(newStock) {
        if (this._stock !== newStock) {
            this.onStockChange(newStock, this._stock);
            this._stock = newStock;
        }
    }

    onStockChange(newStock, oldStock) {
        let scale = newStock / this.capacity;
        this.shape.scale.set(this.baseScale * scale);
    }
}

export class Tree extends Resource {
    static resourceSpot = {
        svg: null
    };
    resourceSpotTexture: InjectedSVG;

    constructor(x, y, size, svg) {
        super(Game.layers.resources.trees, x, y, size + GraphicsConfig.character.size, randomRotation(), svg);

        this.resourceSpotTexture = new InjectedSVG(Tree.resourceSpot.svg, x, y, this.size, this.rotation);
        Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
    }

    createMinimapIcon() {
        let shape = new PIXI.Graphics();
        let miniMapCfg = GraphicsConfig.miniMap.icons.tree;
        shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
        shape.drawCircle(0, 0, this.size * miniMapCfg.sizeFactor);

        return shape;
    }

    hide() {
        this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
        super.hide();
    }
}

let treeCfg = GraphicsConfig.resources.tree;
Preloading.registerGameObjectSVG(Tree.resourceSpot, treeCfg.spotFile, treeCfg.maxSize);

export class RoundTree extends Tree {
    static svg;

    constructor(x, y, size) {
        super(x, y, size, RoundTree.svg);
    }
}

Preloading.registerGameObjectSVG(RoundTree, treeCfg.roundTreeFile, treeCfg.maxSize);

export class MarioTree extends Tree {
    static svg;

    constructor(x, y, size) {
        super(x, y, size, MarioTree.svg);
    }
}

Preloading.registerGameObjectSVG(MarioTree, treeCfg.deciduousTreeFile, treeCfg.maxSize);

export class Mineral extends Resource {
    static resourceSpot = {
        svg: null
    };
    resourceSpotTexture: InjectedSVG;

    constructor(x, y, size, svg) {
        // Due to the shadow in the mineral graphics, those should not be randomly rotated
        super(Game.layers.resources.minerals, x, y, size, 0, svg);

        this.resourceSpotTexture = new InjectedSVG(Mineral.resourceSpot.svg, x, y, this.size, this.rotation);
        Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
    }

    hide() {
        this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
        super.hide();
    }
}

let mineralCfg = GraphicsConfig.resources.mineral;
Preloading.registerGameObjectSVG(Mineral.resourceSpot, mineralCfg.spotFile, mineralCfg.maxSize);

export class Stone extends Mineral {
    static svg;

    constructor(x, y, size) {
        super(x, y, size, Stone.svg);
    }

    createMinimapIcon() {
        let shape = new PIXI.Graphics();
        let miniMapCfg = GraphicsConfig.miniMap.icons.stone;
        shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
        shape.rotation = this.rotation;
        shape.drawPolygon(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 6, true));

        return shape;
    }
}

Preloading.registerGameObjectSVG(Stone, mineralCfg.stoneFile, mineralCfg.maxSize);

export class Bronze extends Mineral {
    static svg;

    constructor(x, y, size) {
        super(x, y, size, Bronze.svg);
    }

    createMinimapIcon() {
        let shape = new PIXI.Graphics();
        let miniMapCfg = GraphicsConfig.miniMap.icons.bronze;
        shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
        shape.rotation = this.rotation;
        shape.drawPolygon(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 5, true));

        return shape;
    }
}

Preloading.registerGameObjectSVG(Bronze, mineralCfg.bronzeFile, mineralCfg.maxSize);

export class Iron extends Mineral {
    static svg;

    constructor(x, y, size) {
        super(x, y, size, Iron.svg);
    }

    createMinimapIcon() {
        let shape = new PIXI.Graphics();
        let miniMapCfg = GraphicsConfig.miniMap.icons.iron;
        shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
        shape.rotation = this.rotation;
        shape.drawPolygon(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 6, true));

        return shape;
    }
}

Preloading.registerGameObjectSVG(Iron, mineralCfg.ironFile, mineralCfg.maxSize);

export class Titanium extends Mineral {
    static svg;

    constructor(x, y, size) {
        super(x, y, size, Titanium.svg);
    }

    createMinimapIcon() {
        let shape = new PIXI.Graphics();
        let miniMapCfg = GraphicsConfig.miniMap.icons.titanium;
        shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
        shape.rotation = this.rotation;
        shape.drawPolygon(TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 4, true));

        return shape;
    }
}

Preloading.registerGameObjectSVG(Titanium, mineralCfg.titaniumFile, mineralCfg.maxSize);

let berryBushCfg = GraphicsConfig.resources.berryBush;

export class BerryBush extends Resource {
    static svg;
    static berry = {
        svg: null
    };

    actualShape;
    berries;

    constructor(x, y, size) {
        super(Game.layers.resources.berryBush, x, y, size, randomRotation(), BerryBush.svg);
    }

    initShape(svg, x, y, size, rotation) {
        let group = new PIXI.Container();
        group.position.set(x, y);

        this.actualShape = super.initShape(svg, 0, 0, size, rotation);
        group.addChild(this.actualShape);

        return group;
    }

    createMinimapIcon() {
        let shape = new PIXI.Graphics();
        let miniMapCfg = GraphicsConfig.miniMap.icons.berryBush;
        shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
        shape.drawCircle(0, 0, this.size * miniMapCfg.sizeFactor);

        return shape;
    }

    onStockChange(numberOfBerries) {
        if (isDefined(this.berries)) {
            this.berries.parent.removeChild(this.berries);
        }

        this.berries = new PIXI.Container();
        this.shape.addChild(this.berries);

        for (let i = 0; i < this.capacity; i++) {
            if (i >= numberOfBerries) {
                break;
            }

            let berry = new InjectedSVG(
                BerryBush.berry.svg,
                (Math.cos(Math.PI * 2 / this.capacity * i) * this.size * 0.3),
                (Math.sin(Math.PI * 2 / this.capacity * i) * this.size * 0.3),
                berryBushCfg.berrySize
            );
            this.berries.addChild(berry);
        }
    }
}

Preloading.registerGameObjectSVG(BerryBush, berryBushCfg.bushfile, berryBushCfg.maxSize);
Preloading.registerGameObjectSVG(BerryBush.berry, berryBushCfg.berryFile, berryBushCfg.berrySize);

let flowerCfg = GraphicsConfig.resources.flower;

export class Flower extends Resource {
    static svg;

    constructor(x, y, size) {
        super(Game.layers.resources.berryBush, x, y, size, 0, Flower.svg);
        this.visibleOnMinimap = false;
    }
}

Preloading.registerGameObjectSVG(Flower, flowerCfg.file, flowerCfg.maxSize);