import {Application, Container, ContainerChild, ViewContainer} from 'pixi.js';
import {registerPreload} from '../../core/logic/Preloading';
import * as HUD from '../../user-interface/HUD/logic/HUD';
import {IMiniMapRendered, Layer, LevelOfDynamic} from './MiniMapInterfaces';
import {gameObjectId} from '../../common/logic/Types';
import {createNamedContainer} from '../../pixi-js/logic/CustomData';
import {Character} from '../../game-objects/logic/Character';
import {BasicConfig} from '../../../client-data/BasicConfig';

const sizeFactorRelatedToMapSize = 2;

export class MiniMap {
    mapWidth: number;
    mapHeight: number;

    /**
     * All game objects added to the minimap.
     */
    registeredGameObjectIds: Set<gameObjectId> = new Set<gameObjectId>();

    dynamicIcons: { [key in LevelOfDynamic]?: { [key: gameObjectId]: MiniMapIcon } };
    iconsMarkedForRemoval: { [key: gameObjectId]: MiniMapIcon };

    application: Application;
    stage: Container;
    layerContainers: { [key in Layer]: Container };
    scale: number;
    iconSizeFactor: number;
    paused: boolean;
    playing: boolean;
    private playerCharacter: Character = null;

    public get width(): number {
        return this.application.canvas.width;
    }

    public get height(): number {
        return this.application.canvas.height;
    }

    constructor() {
        let container = HUD.getMinimapContainer();

        this.application = new Application();

        this.dynamicIcons = {
            [LevelOfDynamic.REMOVABLE_REMEMBERED]: {},
            [LevelOfDynamic.REMOVABLE_FORGOTTEN]: {},
            [LevelOfDynamic.DYNAMIC]: {},
        };
        this.iconsMarkedForRemoval = {};

        // noinspection JSIgnoredPromiseFromCall
        registerPreload(this.application.init({
            backgroundAlpha: 0,
            resizeTo: container as HTMLElement,
            antialias: true,
            autoDensity: true,
            // TODO apply devicePixelDensity, see game.ts
        }));
    }

    public setup(mapWidth: number, mapHeight: number) {
        let container = HUD.getMinimapContainer();
        container.appendChild(this.application.canvas);

        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        this.stage = this.application.stage;

        this.layerContainers = {
            [Layer.CHARACTER]: createNamedContainer('character'),
            [Layer.OTHER]: createNamedContainer('other'),
        };
        this.stage.addChild(this.layerContainers[Layer.OTHER]);
        this.stage.addChild(this.layerContainers[Layer.CHARACTER]);

        this.updateScaling();

        this.application.ticker.add(this.update, this);
        this.application.renderer.addListener('resize', this.onResize, this);
    }

    private updateScaling() {
        Object.values(this.layerContainers).forEach((layerContainer) => {
            layerContainer.position.set(
                this.width / 2,
                this.height / 2,
            );
        });

        const previousScale = this.scale;
        this.scale = this.width / this.mapWidth;
        this.iconSizeFactor = this.scale * sizeFactorRelatedToMapSize;

        return previousScale;
    }

    private onResize() {
        const previousScale = this.updateScaling();

        // Adjust all minimap icon's position & size
        Object.values(this.layerContainers).forEach((layerContainer) => {
            layerContainer.children.forEach((child) => {
                this.updateMinimapIconOnResize(child, previousScale);
            });
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

    public start() {
        this.play();
    }

    public stop() {
        this.pause();
    }

    private play() {
        this.playing = true;
        this.paused = false;
        this.application.start();
    };

    private pause() {
        this.playing = false;
        this.paused = true;
        this.application.stop();
    };

    private update() {
        Object.values(this.dynamicIcons[LevelOfDynamic.DYNAMIC]).forEach((icon: MiniMapIcon) => {
            icon.shape.position.x = icon.gameObject.getX() * this.scale;
            icon.shape.position.y = icon.gameObject.getY() * this.scale;
        });

        // Icons that have been marked for removal and should now be in range again
        // will actually be removed --> if they are actually in range, they would not be marked anymore
        Object.values(this.iconsMarkedForRemoval).forEach((icon: MiniMapIcon) => {
            if (this.isInViewport(icon)) {
                // Is within viewport --> drop
                icon.shape.removeFromParent();
                delete this.dynamicIcons[LevelOfDynamic.REMOVABLE_REMEMBERED][icon.gameObjectId];
                delete this.iconsMarkedForRemoval[icon.gameObjectId];
            }
        });
    }

    private isInViewport(icon: MiniMapIcon) {
        if (this.playerCharacter === null) {
            return true;
        }
        if (Math.abs(this.playerCharacter.getX() - icon.gameObject.getX()) > (BasicConfig.VIEWPORT.WIDTH / 2)) {
            return false;
        }
        if (Math.abs(this.playerCharacter.getY() - icon.gameObject.getY()) > (BasicConfig.VIEWPORT.HEIGHT / 2)) {
            return false;
        }

        return true;
    }

    setPlayerCharacter(character: Character) {
        this.playerCharacter = character;
    }

    /**
     * Adds the icon of the object to the map.
     */
    public add(gameObject: IMiniMapRendered) {
        if (this.registeredGameObjectIds.has(gameObject.id)) {
            // The object is already on the mini map
            return;
        }

        this.registeredGameObjectIds.add(gameObject.id);

        if (gameObject.miniMapDynamic === LevelOfDynamic.REMOVABLE_REMEMBERED &&
            this.iconsMarkedForRemoval.hasOwnProperty(gameObject.id)) {
            delete this.iconsMarkedForRemoval[gameObject.id];
            return;
        }

        // Position each icon relative to its position on the real map.
        const minimapIcon = gameObject.createMinimapIcon();
        this.layerContainers[gameObject.miniMapLayer].addChild(minimapIcon);

        minimapIcon.position.set(
            gameObject.getX() * this.scale,
            gameObject.getY() * this.scale,
        );
        minimapIcon.scale.set(this.iconSizeFactor);

        if (gameObject.miniMapDynamic > LevelOfDynamic.STATIC) {
            this.dynamicIcons[gameObject.miniMapDynamic][gameObject.id] = {
                gameObjectId: gameObject.id,
                shape: minimapIcon,
                gameObject: gameObject,
            };
        }
    }

    public remove(gameObject: IMiniMapRendered) {
        const debug: boolean = gameObject.constructor.name === 'TitaniumShard';
        if (debug) console.log('MiniMap.remove', gameObject.constructor.name, gameObject.id, gameObject.miniMapDynamic);
        switch (gameObject.miniMapDynamic) {
            case LevelOfDynamic.STATIC:
                // Doesn't get removed
                return;

            case LevelOfDynamic.REMOVABLE_REMEMBERED: {
                // only remove if within viewport. Otherwise, mark for removal and
                // remove as soon as in viewport OR de-mark if added again
                const icon = this.dynamicIcons[LevelOfDynamic.REMOVABLE_REMEMBERED][gameObject.id];
                if (this.isInViewport(icon)) {
                    if (debug) console.log('isInViewport');
                    // Is within viewport --> drop
                    icon.shape.removeFromParent();
                    delete this.dynamicIcons[LevelOfDynamic.REMOVABLE_REMEMBERED][gameObject.id];
                } else {
                    if (debug) console.log('NOT in viewport');
                    this.iconsMarkedForRemoval[gameObject.id] = icon;
                }
                break;
            }

            case LevelOfDynamic.REMOVABLE_FORGOTTEN:
            case LevelOfDynamic.DYNAMIC: {
                // Just remove it - if gone from viewport or actually removed doesn't make a difference
                const icon = this.dynamicIcons[gameObject.miniMapDynamic][gameObject.id];
                icon.shape.removeFromParent();
                delete this.dynamicIcons[gameObject.miniMapDynamic][gameObject.id];
                break;
            }
        }

        this.registeredGameObjectIds.delete(gameObject.id);
    }

    public clear() {
        this.registeredGameObjectIds.clear();

        this.dynamicIcons[LevelOfDynamic.REMOVABLE_REMEMBERED] = {};
        this.dynamicIcons[LevelOfDynamic.REMOVABLE_FORGOTTEN] = {};
        this.dynamicIcons[LevelOfDynamic.DYNAMIC] = {};
        this.iconsMarkedForRemoval = {};

        Object.values(this.layerContainers).forEach((layerContainer) => {
            layerContainer.removeChildren();
        });

        this.playerCharacter = null;
    }
}

interface MiniMapIcon {
    gameObjectId: gameObjectId;
    shape: ViewContainer;
    gameObject: IMiniMapRendered;
}
