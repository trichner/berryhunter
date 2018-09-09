'use strict';

import * as InventoryListeners from '../items/InventoryListeners';

export default class SubIcon {
    countElement;
    requiredCount;

    constructor(domElement, itemName, iconPath, requiredCount, count) {
        domElement.classList.remove('hidden');
        domElement.getElementsByClassName('itemIcon').item(0).setAttribute('src', iconPath);
        this.countElement = domElement.getElementsByClassName('count').item(0);
        if (this.countElement !== null) {
            this.requiredCount = requiredCount;
            this.count = count;

            InventoryListeners.register(itemName, (count) => {
                this.count = count;
            });
        }
    }

    get count() {
        return parseInt(this.countElement.textContent);
    }

    set count(count) {
        this.countElement.textContent = Math.max(this.requiredCount - count, 0);
    }
}