import * as PIXI from 'pixi.js';
import * as UserInterface from './userInterface/UserInterface';
import {GameObject} from "./gameObjects/_GameObject";

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
    application: PIXI.Application;
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

        this.application = new PIXI.Application({
            width: this.width,
            height: this.height,
            backgroundAlpha: 0,
            resizeTo: container as HTMLElement,
        });

        container.appendChild(this.application.view as unknown as Node);
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

        this.application.ticker.add(this.update, this);
    }

    start() {
        this.play();
    }

    stop() {
        this.pause();
    }

    play() {
        this.playing = true;
        this.paused = false;
        this.application.start();
    };

    pause() {
        this.playing = false;
        this.paused = true;
        this.application.stop();
    };

    private update() {
        this.trackedGameObjects.forEach((gameObject: GameObject) => {
            gameObject.minimapIcon.position.x = gameObject.getX() * this.scale;
            gameObject.minimapIcon.position.y = gameObject.getY() * this.scale;
        });
    }

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
