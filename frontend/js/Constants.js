"use strict";

define([], function () {
	const Constants = {
		MODE_PARAMETERS: {
			MAP_EDITOR: 'map-editor',
			LOCAL_SERVER: 'local',
			DEVELOPMENT: 'develop'
		},
		BASE_MOVEMENT_SPEED: 10,

		ALWAYS_VIEW_CURSOR: true,
		GRID_SPACING: 100,
		FIELDS_IN_QUADRANT: 8,
		PIXEL_PER_METRE: 60,
		BACKEND: {
			REMOTE_URL: 'wss://k42.ch/death-io/game',
		},
		// Milliseconds between ticks
		INPUT_TICKRATE: 33,

		// Used for interpolation
		SERVER_TICKRATE: 33,
		MOVEMENT_INTERPOLATION: true,

		INVENTORY_SLOTS: 8,
		CRAFTING_RANGE: 70,
		PLACEMENT_RANGE: 60
	};

	Constants.QUADRANT_SIZE = Constants.GRID_SPACING * Constants.FIELDS_IN_QUADRANT;

	return Constants;
});