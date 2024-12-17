import {ViewContainer} from 'pixi.js';

export enum Layer {
    CHARACTER,
    OTHER,
}

export enum LevelOfDynamic {
    /**
     * Doesn't move, gets never removed.
     */
    STATIC,

    /**
     * Doesn't change positions, but is just temporary.
     * The mini map will keep this icon even when out of Area of Interest.
     */
    REMOVABLE_REMEMBERED,

    /**
     * Doesn't change positions, but is just temporary.
     * The mini map will remove this icon as soon as it is out of Area of Interest.
     */
    REMOVABLE_FORGOTTEN,

    /**
     * It moves. It's not permanent.
     */
    DYNAMIC,
}

export interface IMiniMapRendered {
    get id(): number;
    getX(): number;
    getY(): number;

    createMinimapIcon(): ViewContainer;
    get miniMapLayer(): Layer
    get miniMapDynamic(): LevelOfDynamic
}
