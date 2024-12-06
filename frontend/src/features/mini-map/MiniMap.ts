import * as HUD from '../user-interface/HUD/logic/HUD';
import {GameObject} from '../game-objects/logic/_GameObject';
import {registerPreload} from '../core/logic/Preloading';
import {Application, Container, ContainerChild} from 'pixi.js';

export enum Layer {
    CHARACTER,
    OTHER
}

const sizeFactorRelatedToMapSize = 2;

export class MiniMap {
    mapWidth: number;
    mapHeight: number;

    /**
     * All game objects added to the minimap.
     */
    registeredGameObjectIds: number[] = [];

    /**
     * Movable game objects those minimap position will be updated continuously.
     */
    trackedGameObjects: GameObject[] = [];
    application: Application;
    stage: Container;
    iconGroup: Container;
    playerGroup: Container;
    scale: number;
    iconSizeFactor: number;
    paused: boolean;
    playing: boolean;

    public get width(): number {
        return this.application.canvas.width;
    }

    public get height(): number {
        return this.application.canvas.height;
    }

    constructor() {
        let container = HUD.getMinimapContainer();

        this.application = new Application();

        // noinspection JSIgnoredPromiseFromCall
        registerPreload(this.application.init({
            backgroundAlpha: 0,
            resizeTo: container as HTMLElement,
            antialias: true,
            autoDensity: true,
        }));
    }

    public setup(mapWidth: number, mapHeight: number) {
        let container = HUD.getMinimapContainer();
        container.appendChild(this.application.canvas);

        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        this.stage = this.application.stage;

        this.iconGroup = new Container();
        this.stage.addChild(this.iconGroup);

        this.playerGroup = new Container();
        this.stage.addChild(this.playerGroup);

        this.updateScaling();

        this.application.ticker.add(this.update, this);
        this.application.renderer.addListener('resize', this.onResize, this);
    }

    private updateScaling() {
        this.iconGroup.position.set(
            this.width / 2,
            this.height / 2,
        );
        this.playerGroup.position.set(
            this.width / 2,
            this.height / 2,
        );
        const previousScale = this.scale;
        this.scale = this.width / this.mapWidth;
        this.iconSizeFactor = this.scale * sizeFactorRelatedToMapSize;

        return previousScale;
    }

    onResize() {
        const previousScale = this.updateScaling();

        // Adjust all minimap icon's position & size
        this.iconGroup.children.forEach((child) => {
            this.updateMinimapIconOnResize(child, previousScale);
        });
        this.playerGroup.children.forEach((child) => {
            this.updateMinimapIconOnResize(child, previousScale);
        });
    }

    private updateMinimapIconOnResize(child: ContainerChild, previousScale: number) {
        const originalX = child.position.x / previousScale;
        const originalY = child.position.y / previousScale;
        const x = originalX * this.scale;
        const y = originalY * this.scale;
        child.position.set(x, y);
        child.scale.set(this.iconSizeFactor);
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
        if (this.registeredGameObjectIds.includes(gameObject.id)) {
            // The object is already on the mini map
            return;
        }

        this.registeredGameObjectIds.push(gameObject.id);

        // Position each icon relative to its position on the real map.
        const minimapIcon = gameObject.createMinimapIcon();
        switch (layer) {
            case Layer.CHARACTER:
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

        if (gameObject.isMovable) {
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
