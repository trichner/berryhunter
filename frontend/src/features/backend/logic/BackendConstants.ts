import {Items} from '../../items/logic/Items';
import {StatusEffect, StatusEffectDefinition} from '../../game-objects/logic/StatusEffect';
import {BerryhunterApi} from './BerryhunterApi';


export const NONE_ITEM_ID = 0;
export const itemLookupTable = [];

function initializeItemLookupTable() {
    itemLookupTable[NONE_ITEM_ID] = null;
    for (let itemName in Items) {
        //noinspection JSUnfilteredForInLoop
        let item = Items[itemName];
        itemLookupTable[item.id] = item;
    }
}

export const statusEffectLookupTable: StatusEffectDefinition[] = [];

function initializeStatusEffectLookupTable() {
    for (let statusEffect in BerryhunterApi.StatusEffect) {
        //noinspection JSUnfilteredForInLoop
        statusEffectLookupTable[BerryhunterApi.StatusEffect[statusEffect]] = StatusEffect[statusEffect];
    }
}

export function setup() {
    initializeItemLookupTable();
    initializeStatusEffectLookupTable();
}
