'use strict';

const PIXEL_PER_METER: number = 120;

export function meter2px(meter: number) {
    return meter * PIXEL_PER_METER;
}

export const BasicConfig = {
    /**
     * Contains all available query parameter that modify the behavior of the game
     */
    MODE_PARAMETERS: <{[key: string]: string}> {
        MAP_EDITOR: 'map-editor',
        DEVELOPMENT: 'develop',
        GROUND_TEXTURE_EDITOR: 'textures',
        NO_DOCKER: 'no-docker',
    },

    VALUE_PARAMETERS: <{[key: string]: string}> {
        DATABASE_URL: 'dbUrl',
        WEBSOCKET_URL: 'wsUrl',
        TOKEN: 'token',
        START_COMMANDS: 'start-cmds',
    },

    /**
     * Meter are the unit in backend. Pixels are units in the frontend.
     *
     * SYNCED WITH BACKEND
     */
    PIXEL_PER_METER: <number> PIXEL_PER_METER,

    /**
     * Movement speed of characters in the game. Is use for camera tracking.
     *
     * SYNCED WITH BACKEND
     */
    BASE_MOVEMENT_SPEED: <number> (PIXEL_PER_METER * 0.055),

    /**
     * true: character movement AND mouse movement adjust the character facing direction
     * false: only mouse movement adjust the character facing direction
     */
    ALWAYS_VIEW_CURSOR: <boolean> true,

    /**
     * Whether the minimap should "forget" the map every time the player starts again
     */
    CLEAR_MINIMAP_ON_DEATH: <boolean>true,

    /**
     * Pixel size of all graphic files. Scaling and loading is done considering this constant.
     */
    GRAPHIC_BASE_SIZE: <number> 100,

    /**
     * Higher numbers = sharper textures, but more texture memory used
     *
     * Default: 1
     */
    GRAPHICS_RESOLUTION: <number> 1,

    /**
     * Settings for the map editor
     */
    mapEditor: {
        /**
         * Defines the distance of the yellow grid lines
         */
        GRID_SPACING: <number> 100,

        /**
         * How many times the GRID_SPACING is 1 quadrant?
         */
        FIELDS_IN_QUADRANT: <number> 8,
    },

    // TODO unused, can be deleted?
    BACKEND: {
        LOCAL_URL: <string> 'ws://localhost:2000/game',
        REMOTE_URL: <string> 'wss://berryhunter.io/game',
    },

    /**
     * Milliseconds between input sampling ticks.
     *
     * SYNCED WITH BACKEND
     */
    INPUT_TICKRATE: <number> 33,

    /**
     * Used for interpolation.
     *
     * SYNCED WITH BACKEND
     */
    SERVER_TICKRATE: <number> 33,

    /**
     * Whether movement of game objects should be smoothed.
     * Can be disabled to save performance.
     */
    MOVEMENT_INTERPOLATION: <boolean> true,

    /**
     * Is there are maximum angle that objects are allowed to turn during one tick?
     */
    LIMIT_TURN_RATE: <boolean> true,

    /**
     * Maximum radians game objects are rotated per millisecond
     * 1 full rotation per half a second
     */
    DEFAULT_TURN_RATE: <number> (2 * 2 * Math.PI / 1000),

    /**
     * Number of available inventory slots.
     *
     * SYNCED WITH BACKEND
     */
    INVENTORY_SLOTS: <number> 9,

    /**
     * How far away a character can be to access workbenches and campfires.
     * Measured in pixels from center to center.
     *
     * SYNCED WITH BACKEND
     */
    CRAFTING_RANGE: <number> 100,

    /**
     * Number of pixels that placeables are placed in front of characters.
     *
     * SYNCED WITH BACKEND
     */
    PLACEMENT_RANGE: <number> 60,

    /**
     * Number of milliseconds that a chat message will stay visible
     */
    CHAT_MESSAGE_DURATION: <number> 5000,
};
