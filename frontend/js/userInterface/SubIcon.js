'use strict';

define(['Utils', 'items/InventoryListeners'], function (Utils, InventoryListeners) {
	class SubIcon {
		constructor(domElement, itemName, iconPath, requiredCount, count) {
			domElement.classList.remove('hidden');
			domElement.getElementsByClassName('itemIcon').item(0).setAttribute('src', iconPath);
			this.countElement = domElement.getElementsByClassName('count').item(0);
			if (this.countElement !== null){
				this.requiredCount = requiredCount;
				this.count = count;

				InventoryListeners.register(itemName, function (count) {
					this.count = count;
				}.bind(this));
			}
		}
	}

	Object.defineProperty(SubIcon.prototype, 'count', {
		get: function () {
			return parseInt(this.countElement.textContent);
		},
		set: function (count) {
			this.countElement.textContent = Math.max(this.requiredCount - count, 0);
		}
	});

	return SubIcon;
});