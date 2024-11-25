import {meter2px} from './BasicConfig';
import {color, integer} from '../old-structure/interfaces/Types';

export const GraphicsConfig = {

    deepWaterColor: <color> 0x1C57B5,
    shallowWaterColor: <color> 0x287aff,
    landColor: <color> 0x006030,

    hitAnimation: {
        /**
         * Maximum opacity of the flood filter that applied on game objects when they are hit.
         */
        floodOpacity: <number> 1,
        duration: <number> 500, //ms
    },

    /**
     * Controls how translucent equipped placeables appear that are not yet placed
     */
    equippedPlaceableOpacity: <number> 0.6,

    character: {
        /**
         * Pixel radius of the character graphic.
         *
         * SYNCED WITH BACKEND
         */
        size: <number> 30,
        file: require('../features/game-objects/assets/character.svg'),

        hands: {
            fillColor: <color> 0xf2a586,
            lineColor: <color> 0x000000,
        },

        craftingIndicator: {
            file: require('../features/game-objects/assets/icons/crafting.svg'),
            size: <number> 20,
            lineColor: <color> 0xc9a741,
            lineWidth: <number> 5, //px
        },

        actionAnimation: {
            /**
             * Should be synchronized with the value below,
             * but is purely used for a smooth client side animation.
             */
            duration: <integer> 500, // ms

            /**
             * How much of the animation is forward - the rest is reversing.
             * 0.4 ==> 40% (200ms of 500ms) are forward movement, 60% is backwards
             */
            relativeDurationForward: <number> 0.35,

            /**
             * How many ticks will the backend communicate an action in progress
             *
             * SYNCED WITH BACKEND
             */
            backendTicks: <integer> 10,
        },
    },

    mobs: {
        dodo: {
            file: require('../features/game-objects/assets/dodo.svg'),
            minSize: <number> 35,
            maxSize: <number> 45,
        },

        saberToothCat: {
            file: require('../features/game-objects/assets/saberToothCat.svg'),
            minSize: <number> 45,
            maxSize: <number> 60,
        },

        mammoth: {
            file: require('../features/game-objects/assets/mammoth.svg'),
            minSize: <number> 85,
            maxSize: <number> 100,
        },
    },

    resources: {
        tree: {
            spotFile: require('../features/game-objects/assets/treeSpot.svg'),
            maxSize: <number> 210,

            roundTreeFile: require('../features/game-objects/assets/roundTree.svg'),
            deciduousTreeFile: require('../features/game-objects/assets/deciduousTree.svg'),
        },

        mineral: {
            spotFile: require('../features/game-objects/assets/stoneSpot.svg'),
            maxSize: <number> 142,

            stoneFile: require('../features/game-objects/assets/stone.svg'),
            bronzeFile: require('../features/game-objects/assets/bronze.svg'),
            ironFile: require('../features/game-objects/assets/iron.svg'),
            titaniumFile: require('../features/game-objects/assets/titanium.svg'),
        },

        berryBush: {
            bushFile: require('../features/game-objects/assets/berryBush.svg'),
            maxSize: <number> (meter2px(0.5) * 2),

            berryFile: require('../features/game-objects/assets/berry.svg'),
            berryMaxSize: <number> 11,
            berryMinSize: <number> 6,

            calyxFile: require('../features/game-objects/assets/berryCalyx.svg'),
        },

        flower: {
            spotFile: require('../features/game-objects/assets/flowerSpot.svg'),
            file: require('../features/game-objects/assets/flower.svg'),
            minSize: <number> (meter2px(0.15) * 2),
            maxSize: <number> (meter2px(0.25) * 2),
        },
    },

    miniMap: {
        /**
         * Every icon has a color and a size. Sizes are scaled just like the mini map.
         */
        icons: <{[key: string]: {color: color, alpha: number, sizeFactor: number}}> {
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
                color: 0xFF00FF,
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
        overlayThreshold: <number> 0.3,

        /**
         * How many milliseconds old values are shown, after a vital sign has been reduced.
         */
        fadeInMS: <number> 1500,
    },

    /**
     * Contains information about types of ground textures that are available for placing.
     */
    groundTextureTypes: <{[key: string]: {displayName: string, file: string, minSize: number, maxSize: number }}> {
        'Dark Green Grass 1': {
            displayName: 'Greens - Gras, dark 1',
            file: require('../features/ground-textures/assets/textures/darkGrass1.svg'),
            minSize: 180,
            maxSize: 300,
        },
        'Dark Green Grass 2': {
            displayName: 'Greens - Gras, dark 2',
            file: require('../features/ground-textures/assets/textures/darkGrass2.svg'),
            minSize: 180,
            maxSize: 300,
        },
        'Green Grass 1': {
            displayName: 'Greens - Gras 1',
            file: require('../features/ground-textures/assets/textures/grass1.svg'),
            minSize: 180,
            maxSize: 300,
        },
        'Green Grass 2': {
            displayName: 'Greens - Gras 2',
            file: require('../features/ground-textures/assets/textures/grass2.svg'),
            minSize: 180,
            maxSize: 300,
        },
        'Dark Stone Patch': {
            displayName: 'Greys - Stone Patch, dark',
            file: require('../features/ground-textures/assets/textures/darkStonePatch.svg'),
            minSize: 130,
            maxSize: 300,
        },
        'Stone Patch': {
            displayName: 'Greys - Stone Patch',
            file: require('../features/ground-textures/assets/textures/stonePatch.svg'),
            minSize: 130,
            maxSize: 300,
        },
        'Pebble': {
            displayName: 'Greys - Pebbles',
            file: require('../features/ground-textures/assets/textures/pebble.svg'),
            minSize: 130,
            maxSize: 200,
        },
        'Dark Pebble': {
            displayName: 'Greys - Pebbles, dark',
            file: require('../features/ground-textures/assets/textures/darkPebble.svg'),
            minSize: 130,
            maxSize: 200,
        },
        'Rubble': {
            displayName: 'Greys - Rubble',
            file: require('../features/ground-textures/assets/textures/rubble.svg'),
            minSize: 50,
            maxSize: 100,
        },
        'Dark Rubble': {
            displayName: 'Greys - Rubble, dark',
            file: require('../features/ground-textures/assets/textures/darkRubble.svg'),
            minSize: 50,
            maxSize: 100,
        },
        'Puddle': {
            displayName: 'Blues - Puddle',
            file: require('../features/ground-textures/assets/textures/puddle.svg'),
            minSize: 60,
            maxSize: 140,
        },
        'Dark Puddle': {
            displayName: 'Blues - Puddle, dark',
            file: require('../features/ground-textures/assets/textures/darkPuddle.svg'),
            minSize: 60,
            maxSize: 140,
        },
        'Flowers': {
            displayName: 'Pinks - Flowers, white outlined',
            file: require('../features/ground-textures/assets/textures/flowers.svg'),
            minSize: 70,
            maxSize: 100,
        },
        'Leaves': {
            displayName: 'Greens - Leaves',
            file: require('../features/ground-textures/assets/textures/leaves.svg'),
            minSize: 50,
            maxSize: 100,
        },
        'Sand': {
            displayName: 'Yellows - Sand',
            file: require('../features/ground-textures/assets/textures/sand1.svg'),
            minSize: 150,
            maxSize: 200,
        },
        /**
         * Same shape as sand, but same color as {@link landColor}.
         */
        'Land': {
            displayName: 'Greens - Land',
            file: require('../features/ground-textures/assets/textures/land1.svg'),
            minSize: 150,
            maxSize: 200,
        }
    }
};
