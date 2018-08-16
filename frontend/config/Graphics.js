'use strict';

define([], function () {

	//noinspection UnnecessaryLocalVariableJS
	const GraphicsConfig = {

		hitAnimation: {
			/**
			 * Maximum opacity of the flood filter that applied on game objects when they are hit.
			 */
			floodOpacity: 1,
			duration: 500 //ms
		},

		/**
		 * Controls how translucent equipped placeables appear that are not yet placed
		 */
		equippedPlaceableOpacity: 0.6,

		character: {
			/**
			 * Pixel radius of the character graphic.
			 *
			 * SYNCED WITH BACKEND
			 */
			size: 30,
			file: 'img/character.svg',

			hands: {
				fillColor: 0xf2a586,
				lineColor: 0x000000
			},

			craftingIndicator: {
				file: 'img/userInterface/crafting.svg',
				size: 20,
				lineColor: 0xc9a741,
				lineWidth: 5 //px
			},

			actionAnimation: {
				/**
				 * In milliseconds.
				 *
				 * Should be synchronized with the value below,
				 * but is purely used for a smooth client side animation.
				 */
				duration: 500,

				/**
				 * How much of the animation is forward - the rest is reversing.
				 * 0.4 ==> 40% (200ms of 500ms) are forward movement, 60% is backwards
				 */
				relativeDurationForward: 0.35,

				/**
				 * How many ticks will the backend communicate an action in progress
				 * SYNCED WITH BACKEND
				 */
				backendTicks: 15
			}
		},

		mobs: {
			dodo: {
				file: 'img/dodo.svg',
				minSize: 35,
				maxSize: 45,
			},

			saberToothCat: {
				file: 'img/saberToothCat.svg',
				minSize: 45,
				maxSize: 60,
			},

			mammoth: {
				file: 'img/mammoth.svg',
				minSize: 85,
				maxSize: 100,
			}
		},

		resources: {
			tree: {
				spotFile: 'img/treeSpot.svg',
				maxSize: 120,

				roundTreeFile: 'img/roundTree.svg',
				deciduousTreeFile: 'img/deciduousTree.svg'
			},

			mineral: {
				spotFile: 'img/stoneSpot.svg',
				maxSize: 60,

				stoneFile: 'img/stone.svg',
				bronzeFile: 'img/bronze.svg',
				ironFile: 'img/iron.svg',
				titaniumFile: 'img/titanium.svg'
			},

			berryBush: {
				bushfile: 'img/berryBush.svg',
				maxSize: 60,

				berryFile: 'img/berry.svg',
				berrySize: 6,
			},

			flower: {
				file: 'img/flower.svg',
				maxSize: 20,
			}
		},

		miniMap: {
			/**
			 * Every icon has a color and a size. Sizes are scaled just like the mini map.
			 */
			icons: {
				character: {
					color: 0x00008B,
					alpha: 1,
					sizeFactor: 3
				},
				tree: {
					color: 0x1F5B0B,
					alpha: 0.8,
					sizeFactor: 0.6
				},
				stone: {
					color: 0x737373,
					alpha: 1,
					sizeFactor: 1
				},
				bronze: {
					color: 0xb57844,
					alpha: 1,
					sizeFactor: 1.5
				},
				iron: {
					color: 0xa46262,
					alpha: 1,
					sizeFactor: 1.3
				},
				titanium: {
					color: 0x181818,
					alpha: 1,
					sizeFactor: 1.3
				},
				berryBush: {
					color: 0xc20071,
					alpha: 1,
					sizeFactor: 1.2
				},
				Workbench: {
					color: 0xFF0000,
					alpha: 1,
					sizeFactor: 1
				},
				Furnace: {
					color: 0xFF8000,
					alpha: 1,
					sizeFactor: 0.4
				}
			}
		},

		vitalSigns: {
			/**
			 * Determines below which relative value screen overlays for vital signs are shown
			 * and how low the satiety has be before auto feed kicks in.
			 */
			overlayThreshold: 0.3,

			/**
			 * How many milliseconds old values are shown, after a vital sign has been reduced.
			 */
			fadeInMS: 1500
		},

		/**
		 * Contains information about types of ground textures that are available for placing.
		 */
		groundTextureTypes: {
			'Grass, dark green': {
				file: 'darkGreenGrass1',
				minSize: 80,
				maxSize: 300,
			},
			'Grass, light green': {
				file: 'lightGreenGrass1',
				minSize: 80,
				maxSize: 300,
			},
			'Flowers1': {
				file: 'flowers1',
				minSize: 50,
				maxSize: 100,
			},
			'Flowers2': {
				file: 'flowers2',
				minSize: 50,
				maxSize: 100,
			},
			'Stone Patch': {
				file: 'stonePatch1',
				minSize: 100,
				maxSize: 300,
			},
			// 'Grass, blade of grass': {
			// 	file: 'grass1',
			// 	minSize: 30,
			// 	maxSize: 70,
			// 	rotation: false,
			// 	flipVertical: false,
			// },
			'Leaves, green': {
				file: 'leaves1',
				minSize: 30,
				maxSize: 100,
			},
			// 'Mushrooms': {
			// 	file: 'mushrooms1',
			// 	minSize: 30,
			// 	maxSize: 100,
			// 	rotation: false,
			// 	flipVertical: false,
			// },
			'Pebble1': {
				file: 'pebble1',
				minSize: 30,
				maxSize: 100,
			},
			'Pebble2': {
				file: 'pebble2',
				minSize: 30,
				maxSize: 100,
			},
			// 'Puddle': {
			// 	file: 'puddle1',
			// 	minSize: 30,
			// 	maxSize: 100,
			// 	rotation: false,
			// 	flipVertical: false,
			// },
			'Rubble': {
				file: 'rubble1',
				minSize: 30,
				maxSize: 100,
			},
			'Sand': {
				file: 'sand1',
				minSize: 150,
				maxSize: 200,
			}
		}
	};

	return GraphicsConfig;
});