"use strict";

var Constants = {
	BASE_MOVEMENT_SPEED: 10,
	GRID_SPACING: 100,
	FIELDS_IN_QUADRANT: 8,
	SHOW_FPS: true,
	PIXEL_PER_METRE: 60,
	BACKEND: {
		URL: "ws://localhost:2000/echo"
	},
	INPUT_TICKRATE: 33 // Milliseconds between ticks

};

Constants.QUADRANT_SIZE= Constants.GRID_SPACING * Constants.FIELDS_IN_QUADRANT;
