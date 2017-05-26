"use strict";

const Constants = {
	BASE_MOVEMENT_SPEED: 10,
	GRID_SPACING: 100,
	FIELDS_IN_QUADRANT: 8,
	PIXEL_PER_METRE: 60,
	BACKEND: {
		URL: "wss://k42.ch/death-io/game"
	},
	INPUT_TICKRATE: 33, // Milliseconds between ticks

	INVENTORY_SLOTS: 8,

	DEBUGGING: {
		SHOW_FPS: true,
		SHOW_AABBS: true,
		CAMERA_IGNORES_MAP_BOUNDARIES: true,

		/**
		 * Aus wievielen Werten wird maximal der Durchschnitt und die
		 * mittlere absolute Abweichung gebildet
		 */
		MEASUREMENT_SAMPLE_RATE: 20
	}
};

Constants.QUADRANT_SIZE = Constants.GRID_SPACING * Constants.FIELDS_IN_QUADRANT;
