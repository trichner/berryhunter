import * as PIXI from 'pixi.js';
import * as UserInterface from './userInterface/UserInterface';
import {GameObject} from "./gameObjects/_GameObject";
import {AbstractRenderer} from "pixi.js";

export enum Layer {
    CHARACTER,
    OTHER
}

export class MiniMap {
    mapWidth: number;
    mapHeight: number;
    registeredGameObjectIds: number[];
    trackedGameObjects: GameObject[];
    width: number;
    height: number;
    renderer: AbstractRenderer;
    stage: PIXI.Container;
    iconGroup: PIXI.Container;
    playerGroup: PIXI.Container;
    scale: number;
    iconSizeFactor: number;
    paused: boolean;
    playing: boolean;

    constructor(mapWidth: number, mapHeight: number) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        /**
         * All game objects added to the minimap.
         */
        this.registeredGameObjectIds = [];

        /**
         * Moveable game objects those minimap position will be updated continuously.
         */
        this.trackedGameObjects = [];

        let container = UserInterface.getMinimapContainer();

        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.renderer = PIXI.autoDetectRenderer({
            width: this.width,
            height: this.height,
            backgroundAlpha: 0,
        });
        container.appendChild(this.renderer.view);
        this.stage = new PIXI.Container();

        this.iconGroup = new PIXI.Container();
        this.stage.addChild(this.iconGroup);
        this.iconGroup.position.set(
            this.width / 2,
            this.height / 2
        );

        this.playerGroup = new PIXI.Container();
        this.stage.addChild(this.playerGroup);
        this.playerGroup.position.set(
            this.width / 2,
            this.height / 2
        );

        const sizeFactorRelatedToMapSize = 2;
        this.scale = this.width / this.mapWidth;
        this.iconSizeFactor = this.scale * sizeFactorRelatedToMapSize;

        this.renderer.on('prerender', update.bind(this));
    }

    start() {
        this.play();
    }

    stop() {
        this.pause();
    }

    loop() {
        if (this.paused) {
            return;
        }

        requestAnimationFrame(this.loop.bind(this));

        this.renderer.render(this.stage);
    };

    play() {
        this.playing = true;
        this.paused = false;
        this.loop();
    };

    pause() {
        this.playing = false;
        this.paused = true;
    };

    /**
     * Adds the icon of the object to the map.
     */
    add(gameObject: GameObject, layer: Layer) {
        if (this.registeredGameObjectIds.indexOf(gameObject.id) !== -1) {
            // The object is already on the minimao
            return;
        }

        this.registeredGameObjectIds.push(gameObject.id);

        // Position each icon relative to its position on the real map.
        const minimapIcon = gameObject.createMinimapIcon();
        switch (layer) {
            case Layer.CHARACTER:
                console.log('Add character to minimap');
                this.playerGroup.addChild(minimapIcon);
                break;
            case Layer.OTHER:
                this.iconGroup.addChild(minimapIcon);
                break;
        }

        let x = gameObject.getX() * this.scale;
        let y = gameObject.getY() * this.scale;
        minimapIcon.position.set(x, y);
        minimapIcon.scale.set(this.iconSizeFactor);

        if (gameObject.isMoveable) {
            gameObject.minimapIcon = minimapIcon;
            this.trackedGameObjects.push(gameObject);
        }
        return minimapIcon;
    }

    clear() {
        this.registeredGameObjectIds.length = 0;
        this.trackedGameObjects.length = 0;
        this.playerGroup.removeChildren();
        this.iconGroup.removeChildren();
    }

}

function update() {
    this.trackedGameObjects.forEach((gameObject: GameObject) => {
        gameObject.minimapIcon.position.x = gameObject.getX() * this.scale;
        gameObject.minimapIcon.position.y = gameObject.getY() * this.scale;
    });
}
