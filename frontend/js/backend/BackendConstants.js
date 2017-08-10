"use strict";

define(['items/Items'], function (Items) {
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

	BackendConstants.setup = function () {
		initializeItemLookupTable();
	};
	BackendConstants.NONE_ITEM_ID = NONE_ITEM_ID;
	BackendConstants.itemLookupTable = itemLookupTable;

	return BackendConstants;
});