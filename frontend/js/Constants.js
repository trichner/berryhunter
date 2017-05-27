"use strict";

const Constants = {
	MODE_PARAMETERS: {
		MAP_EDITOR: 'map-editor',
		LOCAL_SERVER: 'local',
		DEVELOPMENT: 'develop'
	},
	BASE_MOVEMENT_SPEED: 10,
	ALWAYS_VIEW_CURSOR: false,
	GRID_SPACING: 100,
	FIELDS_IN_QUADRANT: 8,
	PIXEL_PER_METRE: 60,
	BACKEND: {
		REMOTE_URL: 'wss://k42.ch/death-io/game',
	},
	INPUT_TICKRATE: 33, // Milliseconds between ticks

	INVENTORY_SLOTS: 8,

	DEBUGGING: {

	}
};

Constants.QUADRANT_SIZE = Constants.GRID_SPACING * Constants.FIELDS_IN_QUADRANT;
