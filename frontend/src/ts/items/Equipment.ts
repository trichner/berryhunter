'use strict';

import {ItemType} from './ItemType';

export enum EquipmentSlot {
    HAND = 'HAND',

    /**
     * Virtual slot. Reserved for placeables that are about to be placed.
     */
    PLACEABLE = 'PLACEABLE'
}

export const Helper = {
    getItemEquipmentSlot: function (item): EquipmentSlot {
        switch (item.type) {
            case ItemType.EQUIPMENT:
                return item.equipment.slot;
            case ItemType.PLACEABLE:
                return EquipmentSlot.PLACEABLE;
        }
    }
};
