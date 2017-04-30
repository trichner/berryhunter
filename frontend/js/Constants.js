"use strict";

var Constants = {
	BASE_MOVEMENT_SPEED: 1,
	GRID_SPACING: 100,
	FIELDS_IN_QUADRANT: 8,
	SHOW_FPS: true,
	PIXEL_PER_METRE: 60,
	BACKEND: {
		URL: "wss://k42.ch/death-io/game"
	},
	INPUT_TICKRATE: 33 // Milliseconds between ticks

};

Constants.QUADRANT_SIZE= Constants.GRID_SPACING * Constants.FIELDS_IN_QUADRANT;
