'use strict';

import {ItemType} from './ItemType';

export const Slots = {
    HAND: 'HAND',

    /**
     * Virtual slot. Reserved for placeables that are about to be placed.
     */
    PLACEABLE: 'PLACEABLE'
};

export const Helper = {
    getItemEquipmentSlot: function (item) {
        switch (item.type) {
            case ItemType.EQUIPMENT:
                return item.equipmentSlot;
            case ItemType.PLACEABLE:
                return Slots.PLACEABLE;
        }
    }
};
