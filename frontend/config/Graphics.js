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
				fle: 'img/mammoth.svg',
				minSize: 70,
				maxSize: 100,
			}
		},

		miniMap: {
			/**
			 * Every icon has a color and a size. Sizes are scaled just like the mini map.
			 */
			icons: {
				character: {
					color: 0x00008B,
					size: 90
				}
			}
		}
	};

	return GraphicsConfig;
});