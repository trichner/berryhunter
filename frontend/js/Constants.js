"use strict";

define([], function () {
	const Constants = {
		MODE_PARAMETERS: {
			MAP_EDITOR: 'map-editor',
			LOCAL_SERVER: 'local',
			SERVER_PORT: 'port',
			DEVELOPMENT: 'develop'
		},
		USE_NAMED_GROUPS: true,

		BASE_MOVEMENT_SPEED: 10,

		ALWAYS_VIEW_CURSOR: true,
		CLEAR_MINIMAP_ON_DEATH: true,
		GRID_SPACING: 100,
		GRAPHIC_BASE_SIZE: 100,
		FIELDS_IN_QUADRANT: 8,
		BACKEND: {
			LOCAL_URL: 'ws://localhost:2000/game',
			REMOTE_URL: 'wss://berryhunter.io/game',
		},
		// Milliseconds between ticks
		INPUT_TICKRATE: 33,

		// Used for interpolation
		SERVER_TICKRATE: 33,
		MOVEMENT_INTERPOLATION: false,

		LIMIT_TURN_RATE: true,
		// Maximum radians game objects are rotated per millisecond
		// 1 rotation per half a second
		DEFAULT_TURN_RATE: 2 * 2 * Math.PI / 1000,

		INVENTORY_SLOTS: 8,
		CRAFTING_RANGE: 70,
		PLACEMENT_RANGE: 60,

		/**
		 * Number of milliseconds that a chat message will stay visible
		 */
		CHAT_MESSAGE_DURATION: 5000
	};

	Constants.QUADRANT_SIZE = Constants.GRID_SPACING * Constants.FIELDS_IN_QUADRANT;

	return Constants;
});