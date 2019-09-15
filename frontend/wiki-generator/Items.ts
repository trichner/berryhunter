import {ItemType} from "../src/ts/items/ItemType";
import * as Equipment from "../src/ts/items/Equipment";

export const ItemsConfig = {
    None: {
        definition: require('../../api/items/none.json'),
        equipment: {
            animation: 'swing'
        }
    },
    WoodClub: {
        icon: {file: require('../src/img/items/clubWoodIcon.svg')},
        graphic: {
            file: require('../src/img/items/clubWood.svg'),
            size: 40,
            offsetX: 15
        },
        definition: require('../../api/items/tools/wood-club.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: Equipment.Slots.HAND,
            animation: 'swing'
        }
    },
};