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
				file: 'img/crafting.svg',
				size: 20,
				lineColor: 0xc9a741,
				lineWidth: 5 //px
			}
		},

		mobs: {
			dodo: {
				file: 'img/dodo.svg',
				minSize: 30,
				maxSize: 45,
			},

			saberToothCat: {
				file: 'img/saberToothCat.svg',
				minSize: 40,
				maxSize: 60,
			},

			mammoth: {
				file: 'img/mammoth.svg',
				minSize: 70,
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
				ironFile: 'img/iron.svg'
			},

			berryBush: {
				bushfile: 'img/berryBush.svg',
				maxSize: 60,

				berryFile: 'img/berry.svg',
				berrySize: 5,
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
					sizeFactor: 1
				},
				iron: {
					color: 0xa46262,
					alpha: 1,
					sizeFactor: 1
				},
				berryBush: {
					color: 0xc20071,
					alpha: 1,
					sizeFactor: 1.2
				}
			}
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
			'Grass, blade of grass': {
				file: 'grass1',
				minSize: 30,
				maxSize: 70,
				rotation: false,
				flipVertical: false,
			},
			'Leaves, green': {
				file: 'leaves1',
				minSize: 30,
				maxSize: 100,
			},
			'Mushrooms': {
				file: 'mushrooms1',
				minSize: 30,
				maxSize: 100,
				rotation: false,
				flipVertical: false,
			},
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
			'Puddle': {
				file: 'puddle1',
				minSize: 30,
				maxSize: 100,
				rotation: false,
				flipVertical: false,
			},
			'Rubble': {
				file: 'rubble1',
				minSize: 30,
				maxSize: 100,
			}
		}
	};

	return GraphicsConfig;
});