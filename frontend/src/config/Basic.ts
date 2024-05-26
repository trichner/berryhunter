"use strict";

const PIXEL_PER_METER = 120;

export const BasicConfig = {
	/**
	 * Contains all available query parameter that modify the behavior of the game
	 */
	MODE_PARAMETERS: {
        MAP_EDITOR: 'map-editor',
		DEVELOPMENT: 'develop',
		GROUND_TEXTURE_EDITOR: 'textures',
        NO_DOCKER: 'no-docker'
	},
	/**
	 * If custom graphic containers should be used, that are named.
	 */
	USE_NAMED_GROUPS: false,

	/**
	 * Meter are the unity in backend. Pixel are units in the frontend.
	 *
	 * SYNCED WITH BACKEND
	 */
	PIXEL_PER_METER: PIXEL_PER_METER,

	/**
	 * Movement speed of characters in the game. Is use for camera tracking.
	 *
	 * SYNCED WITH BACKEND
	 */
	BASE_MOVEMENT_SPEED: PIXEL_PER_METER * 0.055,

	/**
	 * true: character movement AND mouse movement adjust the character facing direction
	 * false: only mouse movement adjust the character facing direction
	 */
	ALWAYS_VIEW_CURSOR: true,

	/**
	 * Whether or not the minimap should "forget" the map every time the player starts again
	 */
	CLEAR_MINIMAP_ON_DEATH: true,

	/**
	 * Pixel size of all graphic files. Scaling and loading is done considering this constant.
	 */
	GRAPHIC_BASE_SIZE: 100,

	/**
	 * Settings for the map editor
	 */
	mapEditor: {
		/**
		 * Defines the distance of the yellow grid lines
		 */
		GRID_SPACING: 100,

		/**
		 * How many times the GRID_SPACING is 1 quadrant?
		 */
		FIELDS_IN_QUADRANT: 8,
	},

	// TODO unused, can be deleted?
	BACKEND: {
		LOCAL_URL: 'ws://localhost:2000/game',
		REMOTE_URL: 'wss://berryhunter.io/game',
	},
	
	/**
	 * Milliseconds between input sampling ticks.
	 *
	 * SYNCED WITH BACKEND
	 */
	INPUT_TICKRATE: 33,

	/**
	 * Used for interpolation.
	 *
	 * SYNCED WITH BACKEND
	 */
	SERVER_TICKRATE: 33,

	/**
	 * Whether or not movement of game objects should be smoothed.
	 * Can be disabled to save performance.
	 */
	MOVEMENT_INTERPOLATION: true,

	/**
	 * Is there are maximum angle that objects are allowed to turn during one tick?
	 */
	LIMIT_TURN_RATE: true,

	/**
	 * Maximum radians game objects are rotated per millisecond
	 * 1 full rotation per half a second
	 */
	DEFAULT_TURN_RATE: 2 * 2 * Math.PI / 1000,

	/**
	 * Number of available inventory slots.
	 *
	 * SYNCED WITH BACKEND
	 */
	INVENTORY_SLOTS: 9,

	/**
	 * How far away a character can be to access workbenches and campfires.
	 * Measured in pixels from center to center.
	 *
	 * SYNCED WITH BACKEND
	 */
	CRAFTING_RANGE: 100,

	/**
	 * Number of pixels that placeables are placed in front of characters.
	 *
	 * SYNCED WITH BACKEND
	 */
	PLACEMENT_RANGE: 60,

	/**
	 * Number of milliseconds that a chat message will stay visible
	 */
	CHAT_MESSAGE_DURATION: 5000,
};
