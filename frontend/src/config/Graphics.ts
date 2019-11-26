'use strict';

import {BasicConfig} from "./Basic";

export const GraphicsConfig = {

    waterColor: 0x287aff,
    landColor: 0x006030,

    hitAnimation: {
        /**
         * Maximum opacity of the flood filter that applied on game objects when they are hit.
         */
        floodOpacity: 1,
        duration: 500, //ms
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
        file: require('../img/character.svg'),

        hands: {
            fillColor: 0xf2a586,
            lineColor: 0x000000,
        },

        craftingIndicator: {
            file: require('../img/userInterface/crafting.svg'),
            size: 20,
            lineColor: 0xc9a741,
            lineWidth: 5, //px
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
            backendTicks: 10,
        },
    },

    mobs: {
        dodo: {
            file: require('../img/dodo.svg'),
            minSize: 35,
            maxSize: 45,
        },

        saberToothCat: {
            file: require('../img/saberToothCat.svg'),
            minSize: 45,
            maxSize: 60,
        },

        mammoth: {
            file: require('../img/mammoth.svg'),
            minSize: 85,
            maxSize: 100,
        },
    },

    resources: {
        tree: {
            spotFile: require('../img/treeSpot.svg'),
            maxSize: 210,

            roundTreeFile: require('../img/roundTree.svg'),
            deciduousTreeFile: require('../img/deciduousTree.svg'),
        },

        mineral: {
            spotFile: require('../img/stoneSpot.svg'),
            maxSize: 142,

            stoneFile: require('../img/stone.svg'),
            bronzeFile: require('../img/bronze.svg'),
            ironFile: require('../img/iron.svg'),
            titaniumFile: require('../img/titanium.svg'),
        },

        berryBush: {
            bushfile: require('../img/berryBush.svg'),
            maxSize: 60,

            berryFile: require('../img/berry.svg'),
            berrySize: 7,
        },

        flower: {
            spotFile: require('../img/flowerSpot.svg'),
            file: require('../img/flower.svg'),
            minSize: BasicConfig.PIXEL_PER_METER * 0.15 * 2,
            maxSize: BasicConfig.PIXEL_PER_METER * 0.25 * 2,
        },
    },

    miniMap: {
        /**
         * Every icon has a color and a size. Sizes are scaled just like the mini map.
         */
        icons: {
            character: {
                color: 0x00008B,
                alpha: 1,
                sizeFactor: 3,
            },
            tree: {
                color: 0x1F5B0B,
                alpha: 0.8,
                sizeFactor: 0.6,
            },
            stone: {
                color: 0x737373,
                alpha: 1,
                sizeFactor: 1,
            },
            bronze: {
                color: 0xb57844,
                alpha: 1,
                sizeFactor: 1.5,
            },
            iron: {
                color: 0xa46262,
                alpha: 1,
                sizeFactor: 1.3,
            },
            titanium: {
                color: 0x181818,
                alpha: 1,
                sizeFactor: 1.3,
            },
            berryBush: {
                color: 0xc20071,
                alpha: 1,
                sizeFactor: 1.2,
            },
            Workbench: {
                color: 0xFF0000,
                alpha: 1,
                sizeFactor: 1,
            },
            WorkbenchConstruction: {
                color: 0xFF0000,
                alpha: 1,
                sizeFactor: 1,
            },
            Furnace: {
                color: 0xFF8000,
                alpha: 1,
                sizeFactor: 0.4,
            },
        },
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
        fadeInMS: 1500,
    },

    /**
     * Contains information about types of ground textures that are available for placing.
     */
    groundTextureTypes: {
        'Dark Green Grass 1': {
            file: require('../img/groundTextures/darkGrass1.svg'),
            minSize: 180,
            maxSize: 300,
        },
        'Dark Green Grass 2': {
            file: require('../img/groundTextures/darkGrass2.svg'),
            minSize: 180,
            maxSize: 300,
        },
        'Green Grass 1': {
            file: require('../img/groundTextures/grass1.svg'),
            minSize: 180,
            maxSize: 300,
        },
        'Green Grass 2': {
            file: require('../img/groundTextures/grass2.svg'),
            minSize: 180,
            maxSize: 300,
        },
        'Dark Stone Patch': {
            file: require('../img/groundTextures/darkStonePatch.svg'),
            minSize: 130,
            maxSize: 300,
        },
        'Stone Patch': {
            file: require('../img/groundTextures/stonePatch.svg'),
            minSize: 130,
            maxSize: 300,
        },
        'Pebble': {
            file: require('../img/groundTextures/pebble.svg'),
            minSize: 130,
            maxSize: 200,
        },
        'Dark Pebble': {
            file: require('../img/groundTextures/darkPebble.svg'),
            minSize: 130,
            maxSize: 200,
        },
        'Rubble': {
            file: require('../img/groundTextures/rubble.svg'),
            minSize: 50,
            maxSize: 100,
        },
        'Dark Rubble': {
            file: require('../img/groundTextures/darkRubble.svg'),
            minSize: 50,
            maxSize: 100,
        },
        'Puddle': {
            file: require('../img/groundTextures/puddle.svg'),
            minSize: 60,
            maxSize: 140,
        },
        'Dark Puddle': {
            file: require('../img/groundTextures/darkPuddle.svg'),
            minSize: 60,
            maxSize: 140,
        },
        'Flowers': {
            file: require('../img/groundTextures/flowers.svg'),
            minSize: 70,
            maxSize: 100,
        },
        'Leaves': {
            file: require('../img/groundTextures/leaves.svg'),
            minSize: 50,
            maxSize: 100,
        },
        'Sand': {
            file: require('../img/groundTextures/sand1.svg'),
            minSize: 150,
            maxSize: 200,
        }
    }
};