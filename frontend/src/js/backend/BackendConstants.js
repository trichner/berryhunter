'use strict';

define(['items/Items', 'gameObjects/StatusEffect', 'schema_server'], function (Items, StatusEffect) {
	let BackendConstants = {};

	const NONE_ITEM_ID = 0;
	const itemLookupTable = [];

	function initializeItemLookupTable() {
		itemLookupTable[NONE_ITEM_ID] = null;
		for (let itemName in Items) {
			//noinspection JSUnfilteredForInLoop
			let item = Items[itemName];
			itemLookupTable[item.id] = item;
		}
	}

	const statusEffectLookupTable = [];

	function initializeStatusEffectLookupTable() {
		for (let statusEffect in BerryhunterApi.StatusEffect) {
			//noinspection JSUnfilteredForInLoop
			statusEffectLookupTable[BerryhunterApi.StatusEffect[statusEffect]] = StatusEffect[statusEffect];
		}
	}

	BackendConstants.setup = function () {
		initializeItemLookupTable();
		initializeStatusEffectLookupTable();
	};
	BackendConstants.NONE_ITEM_ID = NONE_ITEM_ID;
	BackendConstants.itemLookupTable = itemLookupTable;
	BackendConstants.statusEffectLookupTable = statusEffectLookupTable;

	return BackendConstants;
});