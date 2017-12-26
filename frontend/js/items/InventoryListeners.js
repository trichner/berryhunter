"use strict";

define([], function () {
	const InventoryListeners = {};

	const registeredListeners = {};

	InventoryListeners.register = function (itemName, onChanceCallback) {
		let listeners;
		if (registeredListeners.hasOwnProperty(itemName)){
			listeners = registeredListeners[itemName];
		} else {
			listeners = [];
			registeredListeners[itemName] = listeners;
		}

		listeners.push(onChanceCallback);
	};

	InventoryListeners.notify = function (itemName, count) {
		if (registeredListeners.hasOwnProperty(itemName)){
			let listeners = registeredListeners[itemName];
			listeners.forEach(function (listener) {
				listener(count);
			});
		}
	};

	return InventoryListeners;
});